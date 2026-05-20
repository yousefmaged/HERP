import { saveEntity, loadEntity, loadEntitiesByType } from '../../../app/storage/adapters/local.adapter.js';
import { generateId } from '../../../app/utils/helpers.js';

export async function createProject(name, description) {
  const project = {
    id: generateId('proj'),
    name,
    description,
    status: 'active',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    members: []
  };
  await saveEntity('project', project.id, project);
  return project;
}

export async function assignEmployeeToProject(projectId, employeeId) {
  const project = await loadEntity('project', projectId);
  if (!project) throw new Error('Project not found');
  if (!project.members.includes(employeeId)) {
    project.members.push(employeeId);
    project.updatedAt = Date.now();
    await saveEntity('project', projectId, project);
  }
  return project;
}

export async function getProject(id) {
  return loadEntity('project', id);
}
