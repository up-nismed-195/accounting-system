<script>
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    
    let currentDate = new Date();
    let selectedDate = new Date();
    let showCalendar = false;
    
    // Dashboard data
    let recentProjects = [];
    let dashboardStats = {
        totalProjects: 0,
        totalVouchers: 0,
        totalGross: 0,
        totalNet: 0,
        pendingBills: 0
    };
    
    let recentVouchers = [];
    let loading = true;
    
    onMount(async () => {
        await loadDashboardData();
        loading = false;
    });

    async function loadDashboardData() {
        try {
            // Load recent projects with their summaries
            const { data: projectData, error: projectError } = await supabase
                .from('project_summaries')
                .select('*')
                .order('code', { ascending: false })
                .limit(4);
            
            if (projectError) throw projectError;
            recentProjects = projectData || [];
            
            // Load dashboard statistics
            const { data: allProjects } = await supabase
                .from('project_summaries')
                .select('*');
            
            if (allProjects) {
                dashboardStats.totalProjects = allProjects.length;
                dashboardStats.totalVouchers = allProjects.reduce((sum, p) => sum + (p.total_vouchers || 0), 0);
                dashboardStats.totalGross = allProjects.reduce((sum, p) => sum + (p.gross_total || 0), 0);
                dashboardStats.totalNet = allProjects.reduce((sum, p) => sum + (p.net_total || 0), 0);
            }
            
            // Load recent vouchers
            const { data: voucherData } = await supabase
                .from('liquidations')
                .select('*')
                .order('voucher_date', { ascending: false })
                .limit(5);
            
            recentVouchers = voucherData || [];
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    async function downloadData() {
        try {
            const { data, error } = await supabase
                .from("voucher")
                .select()

            const jsonString = JSON.stringify(data, null, 2)
            const blob = new Blob([jsonString], { type: "application/json "})
            
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "vouchers.json"
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

        } catch (error) {
            console.error(error)
        }

        try {
            const { data, error } = await supabase
                .from("project")
                .select()

            const jsonString = JSON.stringify(data, null, 2)
            const blob = new Blob([jsonString], { type: "application/json "})
            
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "projects.json"
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
                
        } catch (error) {
            console.error(error)
        }
    }
    
    function formatDate(date) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-PH', { 
            style: 'currency', 
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount || 0);
    }
    
    function getDayClass(date) {
        let classes = [];
        if (date.toDateString() === selectedDate.toDateString()) {
            classes.push('bg-green-600 text-white');
        } else if (date.toDateString() === new Date().toDateString()) {
            classes.push('border-green-500');
        }
        return classes.join(' ');
    }
    
    function selectDate(date) {
        selectedDate = date;
        showCalendar = false;
    }
    
    function prevMonth() {
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    }
    
    function nextMonth() {
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }
    
    function getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }
    
    function getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay();
    }
    
    function getMonthDays() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        
        let days = [];
        
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        
        return days;
    }
</script>

<svelte:head>
    <title>UP NISMED - Accounting Dashboard</title>
</svelte:head>

<div class="dashboard-bg min-h-screen">
    <main class="px-6 py-8">
        <div class="max-w-7xl mx-auto">
            <!-- Dashboard Header -->
            <div class="flex items-center justify-between mb-8">
                <div class="flex items-center space-x-4">
                    <h1 class="text-3xl font-bold text-green-900">Accounting Dashboard</h1>
                    <div class="text-sm text-green-600">
                        Welcome back! Here's your project overview.
                    </div>
                </div>
                
                <!-- Header Actions -->
                <div class="relative flex gap-3">
                    <button on:click={downloadData} class="flex justify-between items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                        Download Data
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                        </svg>
                    </button>
                    <button 
                        class="bg-white text-green-900 px-4 py-2 rounded-lg border border-green-200 font-medium hover:bg-green-50 transition-colors flex items-center space-x-2"
                        on:click={() => showCalendar = !showCalendar}
                    >
                        <span>{formatDate(selectedDate)}</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                    </button>
                    
                    {#if showCalendar}
                        <div class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-green-200 z-10 p-4">
                            <div class="flex items-center justify-between mb-4">
                                <button on:click={prevMonth}>
                                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                                    </svg>
                                </button>
                                <span class="font-medium text-green-900">
                                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </span>
                                <button on:click={nextMonth}>
                                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                    </svg>
                                </button>
                            </div>
                            
                            <div class="grid grid-cols-7 gap-1 text-center text-xs text-green-600 font-medium mb-2">
                                <div>S</div>
                                <div>M</div>
                                <div>T</div>
                                <div>W</div>
                                <div>T</div>
                                <div>F</div>
                                <div>S</div>
                            </div>
                            
                            <div class="grid grid-cols-7 gap-1">
                                {#each getMonthDays() as day}
                                    {#if day}
                                        <button 
                                            class={`w-8 h-8 rounded-full text-sm flex items-center justify-center ${getDayClass(day)}`}
                                            on:click={() => selectDate(day)}
                                        >
                                            {day.getDate()}
                                        </button>
                                    {:else}
                                        <div class="w-8 h-8"></div>
                                    {/if}
                                {/each}
                            </div>
                        </div>
                    {/if}
                </div>
            </div>

            {#if loading}
                <div class="flex items-center justify-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            {:else}
                <!-- Summary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <!-- Total Projects -->
                    <div class="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-green-600">Total Projects</p>
                                <p class="text-2xl font-bold text-green-900">{dashboardStats.totalProjects}</p>
                            </div>
                            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                </svg>
                            </div>
                        </div>
                        <p class="text-xs text-green-500 mt-2">Active projects</p>
                    </div>
                    
                    <!-- Total Vouchers -->
                    <div class="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-green-600">Total Vouchers</p>
                                <p class="text-2xl font-bold text-green-900">{dashboardStats.totalVouchers}</p>
                            </div>
                            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                            </div>
                        </div>
                        <p class="text-xs text-green-500 mt-2">Processed vouchers</p>
                    </div>
                    
                    <!-- Total Gross -->
                    <div class="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-green-600">Total Gross</p>
                                <p class="text-2xl font-bold text-green-900">{formatCurrency(dashboardStats.totalGross).replace('PHP', '₱')}</p>
                            </div>
                            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                        </div>
                        <p class="text-xs text-green-500 mt-2">All project amounts</p>
                    </div>
                    
                    <!-- Total Net -->
                    <div class="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-green-600">Total Net</p>
                                <p class="text-2xl font-bold text-green-900">{formatCurrency(dashboardStats.totalNet).replace('PHP', '₱')}</p>
                            </div>
                            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                                </svg>
                            </div>
                        </div>
                        <p class="text-xs text-green-500 mt-2">After taxes</p>
                    </div>
                </div>

                <!-- Main Dashboard Grid -->
                <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    
                    <!-- Recent Projects Section -->
                    <div class="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                        <div class="flex items-center justify-between mb-6">
                            <div>
                                <h2 class="text-xl font-bold text-green-900 mb-2">Recent Projects</h2>
                                <p class="text-green-700">Your 4 most recent projects</p>
                            </div>
                            <a href="/projects" class="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                                View All Projects
                            </a>
                        </div>
                        
                        <div class="space-y-4">
                            {#each recentProjects as project}
                                <div class="p-4 border border-green-100 rounded-lg hover:bg-green-50 transition-colors cursor-pointer">
                                    <div class="flex justify-between items-start">
                                        <div class="flex-1">
                                            <h3 class="font-medium text-green-900">{project.code}</h3>
                                            <p class="text-sm text-green-600 mt-1">{project.name}</p>
                                            <div class="flex items-center gap-4 mt-2">
                                                <span class="text-xs text-green-500">
                                                    {project.total_vouchers || 0} vouchers
                                                </span>
                                                <span class="text-xs text-green-500">
                                                    Gross: {formatCurrency(project.gross_total).replace('PHP', '₱')}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <p class="font-medium text-green-900">
                                                {formatCurrency(project.net_total).replace('PHP', '₱')}
                                            </p>
                                            <p class="text-xs text-green-600 mt-1">Net Amount</p>
                                        </div>
                                    </div>
                                </div>
                            {/each}
                            
                            {#if recentProjects.length === 0}
                                <div class="text-center py-8 text-green-600">
                                    <p>No projects found</p>
                                    <p class="text-sm mt-2">Create your first project to get started</p>
                                </div>
                            {/if}
                        </div>
                    </div>

                    <!-- Recent Vouchers Section -->
                    <div class="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                        <div class="flex items-center justify-between mb-6">
                            <div>
                                <h2 class="text-xl font-bold text-green-900 mb-2">Recent Vouchers</h2>
                                <p class="text-green-700">Latest accounting entries</p>
                            </div>
                            <a href="/vouchers" class="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                                View All Vouchers
                            </a>
                        </div>
                        
                        <div class="space-y-4">
                            {#each recentVouchers as voucher}
                                <div class="p-4 border border-green-100 rounded-lg hover:bg-green-50 transition-colors cursor-pointer">
                                    <div class="flex justify-between items-start">
                                        <div class="flex-1">
                                            <h3 class="font-medium text-green-900">{voucher.dv_no}</h3>
                                            <p class="text-sm text-green-600 mt-1">{voucher.payee_name}</p>
                                            <p class="text-xs text-green-500 mt-1">
                                                {new Date(voucher.voucher_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div class="text-right">
                                            <p class="font-medium text-green-900">
                                                {formatCurrency(voucher.net_amount).replace('PHP', '₱')}
                                            </p>
                                            <p class="text-xs text-green-600 mt-1">Net Amount</p>
                                        </div>
                                    </div>
                                </div>
                            {/each}
                            
                            {#if recentVouchers.length === 0}
                                <div class="text-center py-8 text-green-600">
                                    <p>No vouchers found</p>
                                    <p class="text-sm mt-2">Process your first voucher to get started</p>
                                </div>
                            {/if}
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                        <div class="flex items-center justify-between mb-6">
                            <div>
                                <h2 class="text-xl font-bold text-green-900 mb-2">Quick Actions</h2>
                                <p class="text-green-700">Common tasks and shortcuts</p>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <a href="/projects" class="p-4 bg-green-50 rounded-lg flex flex-col items-center hover:bg-green-100 transition-colors text-center">
                                <div class="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center mb-2">
                                    <svg class="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                    </svg>
                                </div>
                                <span class="text-sm text-green-800">View Projects</span>
                            </a>
                            
                            <a href="/vouchers" class="p-4 bg-green-50 rounded-lg flex flex-col items-center hover:bg-green-100 transition-colors text-center">
                                <div class="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center mb-2">
                                    <svg class="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                </div>
                                <span class="text-sm text-green-800">Manage Vouchers</span>
                            </a>
                            
                            <button class="p-4 bg-green-50 rounded-lg flex flex-col items-center hover:bg-green-100 transition-colors text-center">
                                <div class="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center mb-2">
                                    <svg class="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                </div>
                                <span class="text-sm text-green-800">Generate Report</span>
                            </button>
                            
                            <button class="p-4 bg-green-50 rounded-lg flex flex-col items-center hover:bg-green-100 transition-colors text-center">
                                <div class="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center mb-2">
                                    <svg class="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                    </svg>
                                </div>
                                <span class="text-sm text-green-800">View Analytics</span>
                            </button>
                        </div>
                    </div>

                    <!-- System Status -->
                    <div class="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                        <div class="flex items-center justify-between mb-6">
                            <div>
                                <h2 class="text-xl font-bold text-green-900 mb-2">System Overview</h2>
                                <p class="text-green-700">Current system status</p>
                            </div>
                        </div>
                        
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div class="flex items-center space-x-3">
                                    <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span class="text-sm text-green-900">Database Connection</span>
                                </div>
                                <span class="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                    Connected
                                </span>
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div class="flex items-center space-x-3">
                                    <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span class="text-sm text-green-900">Last Backup</span>
                                </div>
                                <span class="text-xs text-green-600">
                                    {formatDate(new Date())}
                                </span>
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div class="flex items-center space-x-3">
                                    <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span class="text-sm text-green-900">System Health</span>
                                </div>
                                <span class="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                    Excellent
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </main>
</div>

<style>
    .dashboard-bg {
        background: linear-gradient(120deg, #e6f9ec 0%, #f0fdf4 100%);
    }

    /* Custom scrollbar */
    :global(::-webkit-scrollbar) {
        width: 6px;
    }
    :global(::-webkit-scrollbar-track) {
        background: #e6f9ec;
    }
    :global(::-webkit-scrollbar-thumb) {
        background: #6ee7b7;
        border-radius: 3px;
    }
    :global(::-webkit-scrollbar-thumb:hover) {
        background: #34d399;
    }

    /* Loading animation */
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    .animate-spin {
        animation: spin 1s linear infinite;
    }
</style>