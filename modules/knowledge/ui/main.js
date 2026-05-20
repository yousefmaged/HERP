import { createPage, getAllPages, updatePage } from '../services/core.js';
import { commands } from '../commands.js';

let currentPageId = null;

async function loadPages() {
    const pages = await getAllPages();
    const container = document.getElementById('pages-list');
    container.innerHTML = pages.map(p => `
        <div class="page-item" data-id="${p.id}">
            <span>${p.title}</span>
        </div>
    `).join('');
    document.querySelectorAll('.page-item').forEach(el => {
        el.addEventListener('click', () => loadPage(el.dataset.id));
    });
}

async function loadPage(id) {
    const page = await getPage(id);
    if (page) {
        currentPageId = page.id;
        document.getElementById('page-title').value = page.title;
        document.getElementById('page-content').value = page.content;
    }
}

document.getElementById('new-page-btn').addEventListener('click', async () => {
    const newPage = await createPage('صفحة جديدة', '');
    await loadPages();
    loadPage(newPage.id);
});

document.getElementById('save-page-btn').addEventListener('click', async () => {
    if (currentPageId) {
        await updatePage(currentPageId, {
            title: document.getElementById('page-title').value,
            content: document.getElementById('page-content').value
        });
        await loadPages();
    }
});

loadPages();
