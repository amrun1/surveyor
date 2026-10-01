<!-- src/features/tasklist/TaskList.vue -->
<template>
    <div class="space-y-4">
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <h1 class="text-xl font-bold text-slate-800">Task List</h1>
            <p class="text-sm text-slate-500 mt-1">
                Not wired to the real backend yet — this replaces the old empty Dashboard stub as a
                starting point. Next step: pull real rows from
                <code class="text-xs bg-slate-100 px-1.5 py-0.5 rounded">fetchSurveyorTaskList()</code>
                (already built in <code class="text-xs bg-slate-100 px-1.5 py-0.5 rounded">syncService.js</code>,
                confirmed against <code class="text-xs bg-slate-100 px-1.5 py-0.5 rounded">POST
                    /app-surveyor/find</code>), map them through a new domain mapper, and render each task as a
                tappable row that opens the survey form pre-loaded with that task's real data.
            </p>
        </div>
    </div>
</template>
