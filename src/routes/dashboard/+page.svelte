<script>
    import { onMount } from 'svelte';
    
    // Sample data for the charts
    let salesData = [
        { period: 'Due', amount: 0, color: '#e5e7eb' },
        { period: '15 - 21 Jun', amount: 0, color: '#e5e7eb' },
        { period: 'This Week', amount: 0, color: '#e5e7eb' },
        { period: '29 Jun - 5 Jul', amount: 0, color: '#e5e7eb' },
        { period: '6 - 12 Jul', amount: 0, color: '#e5e7eb' },
        { period: 'Not Due', amount: 0, color: '#e5e7eb' }
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

    function connectBank(bankName) {
        banks = banks.map(bank => 
            bank.name === bankName ? { ...bank, connected: true } : bank
        );
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
                        New
                    </button>
                    <h1 class="text-2xl font-bold text-green-900">Dashboard</h1>
                </div>
                <div class="text-sm text-green-700">
                    1-5 / 5
                </div>
            </div>

            <!-- Dashboard Grid -->
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
                
                <!-- Sales Section -->
                <div class="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h2 class="text-xl font-bold text-green-900 mb-2">Sales</h2>
                            <p class="text-green-700">Get Paid online. Send electronic invoices.</p>
                        </div>
                        <button class="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                            New
                        </button>
                    </div>
                    
                    <!-- Sales Chart -->
                    <div class="grid grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                        {#each salesData as item}
                            <div class="text-center">
                                <div class="w-full h-24 bg-green-50 rounded-lg mb-2 flex items-end justify-center p-2">
                                    <div class="w-8 h-16 bg-green-200 rounded"></div>
                                </div>
                                <p class="text-xs text-green-700 leading-tight">{item.period}</p>
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
                    
                    <div class="flex items-center justify-center py-12">
                        <div class="text-center">
                            <div class="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                </svg>
                            </div>
                            <div class="border-2 border-dashed border-green-300 rounded-lg p-6 mb-4">
                                <p class="text-green-700 mb-2">Drag & drop</p>
                                <p class="text-sm text-green-600">or <button class="text-green-700 hover:underline">try our sample</button></p>
                            </div>
                            <div class="flex items-center justify-center space-x-2 text-sm text-green-600">
                                <span>or</span>
                                <button class="text-green-700 hover:underline">Send a bill to purchases@nismedl.odoo.com</button>
                                <span>or</span>
                                <button class="text-green-700 hover:underline">Create manually</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Bank Section -->
                <div class="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                    <div class="mb-6">
                        <h2 class="text-xl font-bold text-green-900 mb-2">Bank</h2>
                        <p class="text-green-700">Connect your bank. Match invoices automatically.</p>
                    </div>
                    
                    <div class="mb-6">
                        <button class="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                            Search over 26,000 banks
                        </button>
                    </div>

                    <!-- Bank Grid -->
                    <div class="grid grid-cols-4 gap-4">
                        {#each banks as bank}
                            <button 
                                class="p-4 border border-green-200 rounded-lg hover:border-green-400 hover:shadow-sm transition-all duration-200 group"
                                on:click={() => connectBank(bank.name)}
                            >
                                <div class="text-2xl mb-2">{bank.logo}</div>
                                <p class="text-xs font-medium text-green-900 group-hover:text-green-700">{bank.name}</p>
                                {#if bank.connected}
                                    <div class="mt-1">
                                        <span class="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                                    </div>
                                {/if}
                            </button>
                        {/each}
                    </div>
                </div>

                <!-- Tax Returns & Miscellaneous -->
                <div class="space-y-8">
                    <!-- Tax Returns Section -->
                    <div class="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                        <div class="mb-6">
                            <h2 class="text-xl font-bold text-green-900 mb-4">Tax Returns</h2>
                            <button class="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors mb-4">
                                Tax Returns
                            </button>
                        </div>
                        
                        <div class="space-y-3">
                            <button class="w-full text-left p-3 hover:bg-green-50 rounded-lg transition-colors">
                                <div class="flex items-center space-x-3">
                                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span class="text-sm text-green-900">Set Company Data</span>
                                </div>
                            </button>
                            <button class="w-full text-left p-3 hover:bg-green-50 rounded-lg transition-colors">
                                <div class="flex items-center space-x-3">
                                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span class="text-sm text-green-900">Set Periods</span>
                                </div>
                            </button>
                            <button class="w-full text-left p-3 hover:bg-green-50 rounded-lg transition-colors">
                                <div class="flex items-center space-x-3">
                                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span class="text-sm text-green-900">Review Chart of Accounts</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <!-- Miscellaneous Operations -->
                    <div class="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-xl font-bold text-green-900">Miscellaneous Operations</h2>
                            <button class="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                                New
                            </button>
                        </div>
                        
                        <div class="flex items-center justify-center py-8">
                            <div class="text-center">
                                <div class="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-3 mx-auto">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                    </svg>
                                </div>
                                <p class="text-green-700">Create your first miscellaneous operation</p>
                            </div>
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