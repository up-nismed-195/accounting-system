<script lang="ts">
  // ===============
  // onMount actions
  // ===============
  
  import { show } from '$lib/helpers';
  import { onMount } from 'svelte';
  onMount(async () => {
    await load_summaries()
  })

  //
  // load summaries
  //

  let summaries: summary[] = []
  import { supabase } from "$lib/supabaseClient";
  async function load_summaries() {
    try {
      const { data, error } = await supabase
        .from("summaries")
        .select();

      if (error) throw error
      summaries = data ?? []
    } catch (error) { 
      show(error)
      summaries = [] 
    } finally {
      // show(summaries)
    }
  }

  //
  // add project
  //

  let showModal = false;
  let newProject: project = {
    code: '',
    title: '',
    tax: 0,
    authorized_rep: '',
    approver: '',
    admin_officer: ''
  };

  async function add_project(new_project: project) {    
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert(new_project)

      if (error) throw error
      alert("project added succesfully")
    } catch (error) {
      alert("error inserting to database")
    }
  }

  function openModal() {
    showModal = true;
  }
  function closeModal() {
    showModal = false;
  }
  async function handleCreateProject() {
    await add_project(newProject);
    closeModal();
    await load_summaries();
    // Reset form
    newProject = {
      code: '',
      title: '',
      tax: 0,
      authorized_rep: '',
      approver: '',
      admin_officer: ''
    };
  }

</script>

<div class="page-header">
  <h1 class="page-title">Projects</h1>
  <span class="text-gray-600/70">|</span>
  <button class="add-project-btn" on:click={openModal}>
    + Add Project
  </button>
</div>

{#if showModal}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-backdrop" on:click={closeModal}></div>
  <div class="modal">
    <h2 class="modal-title">Add New Project</h2>
    <form on:submit|preventDefault={handleCreateProject}>
      <label>Code
        <input type="text" bind:value={newProject.code} required />
      </label>
      <label>Title
        <input type="text" bind:value={newProject.title} required />
      </label>
      <label>Tax (%)
        <input type="number" bind:value={newProject.tax} min="0" step="0.01" required />
      </label>
      <label>Authorized Rep
        <input type="text" bind:value={newProject.authorized_rep} required />
      </label>
      <label>Approver
        <input type="text" bind:value={newProject.approver} required />
      </label>
      <label>Admin Officer
        <input type="text" bind:value={newProject.admin_officer} required />
      </label>
      <div class="modal-actions">
        <button type="button" class="modal-cancel" on:click={closeModal}>Cancel</button>
        <button type="submit" class="modal-submit">Create</button>
      </div>
    </form>
  </div>
{/if}

<table class="summary-table border-2 border-green-800">
  <thead>
    <tr>
      <th>Code</th>
      <th>Title</th>
      <th>Total Vouchers</th>
      <th>Gross Total</th>
      <th>Net Total</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {#each summaries as s}
      <tr>
        <td>{s.code}</td>
        <td>{s.title}</td>
        <td>{s.total_vouchers}</td>
        <td>{s.gross_total}</td>
        <td>{s.net_total}</td>
        <td class="flex gap-3">
          <!-- {s.project_id} -->
          <span class="text-blue-500 hover:underline cursor-pointer">Edit</span>
          <span class="text-red-500 hover:underline cursor-pointer">Delete</span>
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
.page-header {
  display: flex;
  align-items: center;
  justify-content: start;
  margin-bottom: 2rem;
  margin-top: 1rem;
  gap: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: oklch(44.8% 0.119 151.328); /* deep green */
  letter-spacing: -0.5px;
  margin: 0;
}

.add-project-btn {
  background: oklch(44.8% 0.119 151.328);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.15s;
  box-shadow: 0 2px 8px 0 rgba(44, 62, 80, 0.04);
}
.add-project-btn:hover,
.add-project-btn:focus {
  background: oklch(34.389% 0.09873 148.331);
  outline: none;
}

.summary-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0;
}
.summary-table th {
  background: oklch(44.8% 0.119 151.328); /* dark green */
  color: #fff;
  padding: 0.75rem 1rem;
  text-align: left;
}
.summary-table td {
  background: #fff;
  color: #111;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e5e5;
}
.summary-table tr:last-child td {
  border-bottom: none;
}

.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  z-index: 40;
}
.modal {
  position: fixed;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 2rem 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 8px 32px 0 rgba(44, 62, 80, 0.18);
  z-index: 50;
  min-width: 320px;
  max-width: 95vw;
}
.modal-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
  color: oklch(44.8% 0.119 151.328);
}
.modal label {
  display: block;
  margin-bottom: 0.7rem;
  font-weight: 500;
  color: #222;
}
.modal input[type="text"], .modal input[type="number"] {
  width: 100%;
  padding: 0.5rem 0.7rem;
  margin-top: 0.2rem;
  margin-bottom: 0.2rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.4rem;
  font-size: 1rem;
  background: #f9fafb;
  transition: border 0.15s;
}
.modal input:focus {
  border: 1.5px solid oklch(44.8% 0.119 151.328);
  outline: none;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.7rem;
  margin-top: 1.2rem;
}
.modal-cancel {
  background: #e5e7eb;
  color: #222;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 0.4rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.modal-cancel:hover {
  background: #d1d5db;
}
.modal-submit {
  background: oklch(44.8% 0.119 151.328);
  color: #fff;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 0.4rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.modal-submit:hover {
  background: oklch(34.389% 0.09873 148.331);
}
</style>