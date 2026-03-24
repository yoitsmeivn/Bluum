"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orchestrate = orchestrate;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const supabase_js_1 = require("@supabase/supabase-js");
const uuid_1 = require("uuid");
const runAgent_1 = require("./runAgent");
const overview_1 = require("./prompts/overview");
const ma_activity_1 = require("./prompts/ma_activity");
const targets_1 = require("./prompts/targets");
const risks_1 = require("./prompts/risks");
const buyers_1 = require("./prompts/buyers");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey)
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
const ORCHESTRATOR_TIMEOUT = 120000; // 2 minutes
const agentConfig = [
    { name: 'overview', prompt: overview_1.overviewPrompt },
    { name: 'ma_activity', prompt: ma_activity_1.maActivityPrompt },
    { name: 'targets', prompt: targets_1.targetsPrompt },
    { name: 'risks', prompt: risks_1.risksPrompt },
    { name: 'buyers', prompt: buyers_1.buyersPrompt },
];
async function writeSection(researchId, sectionName, content, status = 'done') {
    console.log(`[orchestrator] Writing section ${sectionName} with status ${status}`);
    const { error } = await supabase.from('sections').insert({
        id: (0, uuid_1.v4)(),
        research_id: researchId,
        section_name: sectionName,
        content,
        status,
    });
    if (error) {
        console.error(`[orchestrator] Failed to write section ${sectionName}:`, error);
    }
    else {
        console.log(`[orchestrator] Section ${sectionName} written successfully`);
    }
}
async function orchestrate(researchId, query) {
    console.log('=== ORCHESTRATOR STARTED ===');
    console.log('research_id:', researchId);
    console.log('query:', query);
    console.log('ANTHROPIC_API_KEY present:', !!process.env.ANTHROPIC_API_KEY);
    try {
        const enrichedQuery = `Research query: ${query.trim()}\n\nPlease provide comprehensive analysis based on the most recent available data.`;
        await supabase
            .from('researches')
            .update({ enriched_query: enrichedQuery })
            .eq('id', researchId);
        // Fire all 5 agents in parallel with an overall timeout
        const agentPromises = agentConfig.map(async ({ name, prompt }) => {
            try {
                console.log(`[orchestrator] Starting agent ${name}`);
                const content = await (0, runAgent_1.runAgent)(name, enrichedQuery, prompt);
                await writeSection(researchId, name, content, 'done');
                console.log(`[orchestrator] Agent ${name} completed`);
                return 'done';
            }
            catch (error) {
                console.error(`[orchestrator] Agent ${name} failed:`, error?.message ?? error);
                await writeSection(researchId, name, { error: String(error?.message ?? error) }, 'error');
                return 'error';
            }
        });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Orchestrator timeout after 120s')), ORCHESTRATOR_TIMEOUT));
        let results;
        try {
            results = await Promise.race([
                Promise.allSettled(agentPromises),
                timeoutPromise,
            ]);
        }
        catch (timeoutErr) {
            console.error(`[orchestrator] TIMEOUT:`, timeoutErr.message);
            await supabase.from('researches').update({ status: 'error' }).eq('id', researchId);
            return;
        }
        const allFailed = results.every((r) => r.status === 'rejected' || (r.status === 'fulfilled' && r.value === 'error'));
        const finalStatus = allFailed ? 'error' : 'done';
        console.log(`[orchestrator] All agents settled. Final status: ${finalStatus}`);
        await supabase.from('researches').update({ status: finalStatus }).eq('id', researchId);
    }
    catch (error) {
        console.error(`[orchestrator] Fatal error for ${researchId}:`, error?.message ?? error);
        await supabase.from('researches').update({ status: 'error' }).eq('id', researchId);
    }
}
