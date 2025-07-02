<script>
    import { onMount } from 'svelte';
    
    // Sample data for the charts - now with dynamic values
    let salesData = [
        { period: 'Due', amount: 1250, color: '#10B981' },
        { period: '15 - 21 Jun', amount: 850, color: '#10B981' },
        { period: 'This Week', amount: 4200, color: '#10B981' },
        { period: '29 Jun - 5 Jul', amount: 3100, color: '#10B981' },
        { period: '6 - 12 Jul', amount: 1800, color: '#10B981' },
        { period: 'Not Due', amount: 5600, color: '#D1FAE5' }
    ];

    // Bank logos data
    let banks = [
        { name: 'BDO', logo: '🏦', connected: false },
        { name: 'Security Bank', logo: '🏛️', connected: false },
        { name: 'ING', logo: '🧡', connected: false },
        { name: 'KBC', logo: '🔵', connected: false },
        { name: 'Belfius', logo: '🏦', connected: false },
        { name: 'Chase', logo: '🔷', connected: false },
        { name: 'CBC', logo: '⭐', connected: false },
        { name: 'Rabobank', logo: '🟦', connected: false }
    ];

    let searchQuery = '';
    let favorites = true;
    let currentDate = new Date();
    let selectedDate = new Date();
    let showCalendar = false;
    
    // Recent vouchers data
    let recentVouchers = [
        { id: 'V-001', date: '2023-06-28', amount: 1250.50, type: 'Payment', status: 'Posted' },
        { id: 'V-002', date: '2023-06-27', amount: 845.75, type: 'Receipt', status: 'Posted' },
        { id: 'V-003', date: '2023-06-26', amount: 3200.00, type: 'Journal', status: 'Draft' },
        { id: 'V-004', date: '2023-06-25', amount: 1560.30, type: 'Payment', status: 'Posted' }
    ];
    
    // Upcoming bills
    let upcomingBills = [
        { id: 'B-001', dueDate: '2023-07-05', vendor: 'Office Supplies Co.', amount: 450.00, status: 'Unpaid' },
        { id: 'B-002', dueDate: '2023-07-12', vendor: 'Cloud Services Inc.', amount: 299.00, status: 'Unpaid' },
        { id: 'B-003', dueDate: '2023-07-15', vendor: 'Utility Company', amount: 185.75, status: 'Unpaid' }
    ];

    function connectBank(bankName) {
        banks = banks.map(bank => 
            bank.name === bankName ? { ...bank, connected: !bank.connected } : bank
        );
    }
    
    function formatDate(date) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        
        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        
        return days;
    }
</script>

<svelte:head>
    <title>Accounting Dashboard</title>
</svelte:head>

<div class="dashboard-bg min-h-screen">
    <main class="px-6 py-8">
        <div class="max-w-7xl mx-auto">
            <!-- Dashboard Header -->
            <div class="flex items-center justify-between mb-8">
                <div class="flex items-center space-x-4">
                    <button class="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                        New Voucher
                    </button>
                    <h1 class="text-2xl font-bold text-green-900">Accounting Dashboard</h1>
                </div>
                
                <!-- Date Picker -->
                <div class="relative">
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

            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- Total Revenue -->
                <div class="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-green-600">Total Revenue</p>
                            <p class="text-2xl font-bold text-green-900">$12,450.75</p>
                        </div>
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>
                    <p class="text-xs text-green-500 mt-2">↑ 12% from last month</p>
                </div>
                
                <!-- Expenses -->
                <div class="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-green-600">Total Expenses</p>
                            <p class="text-2xl font-bold text-green-900">$8,230.50</p>
                        </div>
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </div>
                    </div>
                    <p class="text-xs text-green-500 mt-2">↑ 8% from last month</p>
                </div>
                
                <!-- Profit -->
                <div class="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-green-600">Net Profit</p>
                            <p class="text-2xl font-bold text-green-900">$4,220.25</p>
                        </div>
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                        </div>
                    </div>
                    <p class="text-xs text-green-500 mt-2">↑ 18% from last month</p>
                </div>
                
                <!-- Cash Flow -->
                <div class="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-green-600">Cash Flow</p>
                            <p class="text-2xl font-bold text-green-900">$3,150.00</p>
                        </div>
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                            </svg>
                        </div>
                    </div>
                    <p class="text-xs text-green-500 mt-2">↓ 5% from last month</p>
                </div>
            </div>

            <!-- Dashboard Grid -->
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
                
                <!-- Sales Section -->
                <div class="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h2 class="text-xl font-bold text-green-900 mb-2">Sales Overview</h2>
                            <p class="text-green-700">Get Paid online. Send electronic invoices.</p>
                        </div>
                        <button class="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                            New Invoice
                        </button>
                    </div>
                    
                    <!-- Interactive Sales Chart -->
                    <div class="grid grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                        {#each salesData as item}
                            <div class="text-center cursor-pointer group" on:click={() => console.log(`Clicked ${item.period}`)}>
                                <div class="w-full h-24 bg-green-50 rounded-lg mb-2 flex items-end justify-center p-2 hover:bg-green-100 transition-colors">
                                    <div 
                                        class="w-8 h-16 rounded transition-all duration-300 group-hover:w-10 group-hover:opacity-90" 
                                        style={`background-color: ${item.color}; height: ${(item.amount / 6000) * 100}%`}
                                        title={`$${item.amount}`}
                                    ></div>
                                </div>
                                <p class="text-xs text-green-700 leading-tight group-hover:text-green-900 group-hover:font-medium">{item.period}</p>
                                <p class="text-xs text-green-500 mt-1">${item.amount}</p>
                            </div>
                        {/each}
                    </div>
                    
                    <div class="flex justify-between items-center mt-4">
                        <div class="text-sm text-green-600">
                            <span class="font-medium">Total:</span> ${salesData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                        </div>
                        <button class="text-green-600 hover:text-green-800 text-sm font-medium flex items-center">
                            View Detailed Report
                            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Recent Vouchers Section -->
                <div class="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h2 class="text-xl font-bold text-green-900 mb-2">Recent Vouchers</h2>
                            <p class="text-green-700">Latest accounting entries</p>
                        </div>
                        <button class="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                            View All
                        </button>
                    </div>
                    
                    <div class="space-y-4">
                        {#each recentVouchers as voucher}
                            <div class="p-4 border border-green-100 rounded-lg hover:bg-green-50 transition-colors cursor-pointer">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h3 class="font-medium text-green-900">{voucher.id} - {voucher.type}</h3>
                                        <p class="text-sm text-green-600">{voucher.date}</p>
                                    </div>
                                    <div class="text-right">
                                        <p class="font-medium text-green-900">${voucher.amount.toFixed(2)}</p>
                                        <span class={`text-xs px-2 py-1 rounded-full ${
                                            voucher.status === 'Posted' ? 'bg-green-100 text-green-800' : 
                                            voucher.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {voucher.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>

                <!-- Purchases Section -->
                <div class="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h2 class="text-xl font-bold text-green-900 mb-2">Purchases</h2>
                            <p class="text-green-700">Let artificial intelligence scan your bill. Pay easily.</p>
                        </div>
                        <button class="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                            Upload
                        </button>
                    </div>
                    
                    <div class="flex items-center justify-center py-8">
                        <div class="text-center max-w-md">
                            <div class="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                </svg>
                            </div>
                            <div 
                                class="border-2 border-dashed border-green-300 rounded-lg p-6 mb-4 hover:bg-green-50 transition-colors cursor-pointer"
                                on:click={() => alert('File upload dialog would open here')}
                            >
                                <p class="text-green-700 mb-2">Drag & drop your bill here</p>
                                <p class="text-sm text-green-600">or <button class="text-green-700 hover:underline">browse files</button></p>
                            </div>
                            <div class="flex items-center justify-center space-x-2 text-sm text-green-600 flex-wrap">
                                <span>Supports: PDF, JPG, PNG</span>
                                <span class="text-gray-400">•</span>
                                <span>Max 10MB</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Upcoming Bills -->
                    <div class="mt-8">
                        <h3 class="font-medium text-green-900 mb-4">Upcoming Bills</h3>
                        <div class="space-y-3">
                            {#each upcomingBills as bill}
                                <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <div>
                                        <p class="text-sm font-medium text-green-900">{bill.vendor}</p>
                                        <p class="text-xs text-green-600">Due {bill.dueDate}</p>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-sm font-medium text-green-900">${bill.amount.toFixed(2)}</p>
                                        <span class="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                                            {bill.status}
                                        </span>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>

                <!-- Bank Section -->
                <div class="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                    <div class="mb-6">
                        <h2 class="text-xl font-bold text-green-900 mb-2">Bank Connections</h2>
                        <p class="text-green-700">Connect your bank. Match invoices automatically.</p>
                    </div>
                    
                    <div class="mb-6 flex items-center space-x-4">
                        <div class="relative flex-grow">
                            <input 
                                type="text" 
                                bind:value={searchQuery}
                                placeholder="Search banks..." 
                                class="w-full pl-10 pr-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                            <svg class="w-5 h-5 text-green-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                        <button class="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors whitespace-nowrap">
                            Search Banks
                        </button>
                    </div>

                    <!-- Bank Grid with Filtering -->
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {#each banks.filter(bank => 
                            bank.name.toLowerCase().includes(searchQuery.toLowerCase())
                        ) as bank}
                            <button 
                                class={`p-4 border rounded-lg hover:shadow-sm transition-all duration-200 group flex flex-col items-center ${
                                    bank.connected ? 'border-green-400 bg-green-50' : 'border-green-200 hover:border-green-400'
                                }`}
                                on:click={() => connectBank(bank.name)}
                            >
                                <div class="text-2xl mb-2">{bank.logo}</div>
                                <p class="text-xs font-medium text-green-900 group-hover:text-green-700 text-center">{bank.name}</p>
                                {#if bank.connected}
                                    <div class="mt-2 flex items-center">
                                        <span class="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                        <span class="text-xs text-green-600">Connected</span>
                                    </div>
                                {/if}
                            </button>
                        {/each}
                    </div>
                    
                    <!-- Connected Banks Summary -->
                    {#if banks.filter(b => b.connected).length > 0}
                        <div class="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                            <h3 class="font-medium text-green-900 mb-2">Connected Banks</h3>
                            <p class="text-sm text-green-700">
                                You have {banks.filter(b => b.connected).length} bank{banks.filter(b => b.connected).length !== 1 ? 's' : ''} connected. 
                                <a href="#" class="text-green-600 hover:underline ml-2">View transactions</a>
                            </p>
                        </div>
                    {/if}
                </div>

                <!-- Tax Returns & Miscellaneous -->
                <div class="space-y-8">
                    <!-- Tax Returns Section -->
                    <div class="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                        <div class="mb-6">
                            <h2 class="text-xl font-bold text-green-900 mb-4">Tax Returns</h2>
                            <div class="flex space-x-4">
                                <button class="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                                    Tax Returns
                                </button>
                                <button class="border border-green-300 text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors">
                                    Due Dates
                                </button>
                            </div>
                        </div>
                        
                        <div class="space-y-3">
                            <button class="w-full text-left p-3 hover:bg-green-50 rounded-lg transition-colors flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span class="text-sm text-green-900">Set Company Data</span>
                                </div>
                                <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </button>
                            <button class="w-full text-left p-3 hover:bg-green-50 rounded-lg transition-colors flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span class="text-sm text-green-900">Set Periods</span>
                                </div>
                                <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </button>
                            <button class="w-full text-left p-3 hover:bg-green-50 rounded-lg transition-colors flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span class="text-sm text-green-900">Review Chart of Accounts</span>
                                </div>
                                <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-xl font-bold text-green-900">Quick Actions</h2>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <button class="p-4 bg-green-50 rounded-lg flex flex-col items-center hover:bg-green-100 transition-colors">
                                <div class="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center mb-2">
                                    <svg class="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <span class="text-sm text-green-800 text-center">Record Payment</span>
                            </button>
                            
                            <button class="p-4 bg-green-50 rounded-lg flex flex-col items-center hover:bg-green-100 transition-colors">
                                <div class="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center mb-2">
                                    <svg class="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"></path>
                                    </svg>
                                </div>
                                <span class="text-sm text-green-800 text-center">Create Invoice</span>
                            </button>
                            
                            <button class="p-4 bg-green-50 rounded-lg flex flex-col items-center hover:bg-green-100 transition-colors">
                                <div class="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center mb-2">
                                    <svg class="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                    </svg>
                                </div>
                                <span class="text-sm text-green-800 text-center">New Expense</span>
                            </button>
                            
                            <button class="p-4 bg-green-50 rounded-lg flex flex-col items-center hover:bg-green-100 transition-colors">
                                <div class="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center mb-2">
                                    <svg class="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                </div>
                                <span class="text-sm text-green-800 text-center">Generate Report</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
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
</style>