<script>
    // Example projects array; replace with your data source or fetch from backend
    let projects = [
        { id: 'project-1', name: 'Project Alpha' },
        { id: 'project-2', name: 'Project Beta' },
        { id: 'project-3', name: 'Project Gamma' }
    ];
</script>

<h1 class="title">Projects</h1>
<ul class="project-list">
    {#each projects as project}
        <li>
            <a class="project-link" href={`/projects/${project.id}`}>
                <span class="folder-icon">📁</span>
                {project.name}
            </a>
        </li>
    {/each}
</ul>

<style>
.title {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
}
.project-list {
    list-style: none;
    padding: 0;
}
.project-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    background: #f0fdf4;
    color: #166534;
    text-decoration: none;
    font-weight: 500;
    margin-bottom: 0.5rem;
    transition: background 0.15s;
}
.project-link:hover {
    background: #bbf7d0;
}
.folder-icon {
    font-size: 1.3rem;
}
</style>