import { ProjectState } from './types';

export interface SavedProject {
  id: string;
  name: string;
  project: ProjectState;
  thumbnail: string; // Base64 image
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'perlestudio_projects';
const CURRENT_PROJECT_KEY = 'perlestudio_current';
export const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export const useLocalStorage = () => {
  // Load all saved projects
  const loadProjects = (): SavedProject[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  };

  // Save all projects
  const saveProjects = (projects: SavedProject[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects:', error);
      alert('Erreur de sauvegarde. Mémoire pleine ?');
    }
  };

  // Generate simple thumbnail
  const generateThumbnail = (project: ProjectState): string => {
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#f0f0f0"/>
        <text x="50" y="50" text-anchor="middle" dy=".3em" font-size="12" fill="#666">
          ${project.columns}x${project.rows}
        </text>
      </svg>
    `);
  };

  // Save current project
  const saveCurrentProject = (project: ProjectState, name: string = 'Sans titre') => {
    try {
      const projects = loadProjects();
      const existingIndex = projects.findIndex(p => p.name === name);
      
      const thumbnail = generateThumbnail(project);
      
      const savedProject: SavedProject = {
        id: existingIndex >= 0 ? projects[existingIndex].id : Date.now().toString(),
        name,
        project,
        thumbnail,
        createdAt: existingIndex >= 0 ? projects[existingIndex].createdAt : Date.now(),
        updatedAt: Date.now()
      };

      if (existingIndex >= 0) {
        projects[existingIndex] = savedProject;
      } else {
        projects.unshift(savedProject);
      }

      const trimmedProjects = projects.slice(0, 50);
      saveProjects(trimmedProjects);
      localStorage.setItem(CURRENT_PROJECT_KEY, JSON.stringify(savedProject));
      
      return savedProject;
    } catch (error) {
      console.error('Error saving current project:', error);
      return null;
    }
  };

  // Load current project
  const loadCurrentProject = (): SavedProject | null => {
    try {
      const stored = localStorage.getItem(CURRENT_PROJECT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading current project:', error);
      return null;
    }
  };

  // Delete project
  const deleteProject = (id: string) => {
    const projects = loadProjects();
    const filtered = projects.filter(p => p.id !== id);
    saveProjects(filtered);
  };

  // Rename project
  const renameProject = (id: string, newName: string) => {
    const projects = loadProjects();
    const project = projects.find(p => p.id === id);
    if (project) {
      project.name = newName;
      project.updatedAt = Date.now();
      saveProjects(projects);
    }
  };

  // Export project as JSON
  const exportProject = (savedProject: SavedProject) => {
    const dataStr = JSON.stringify(savedProject, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${savedProject.name}.perlestudio.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import project from JSON
  const importProject = (file: File): Promise<SavedProject | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string) as SavedProject;
          imported.id = Date.now().toString();
          imported.createdAt = Date.now();
          imported.updatedAt = Date.now();
          
          const projects = loadProjects();
          projects.unshift(imported);
          saveProjects(projects.slice(0, 50));
          
          resolve(imported);
        } catch (error) {
          console.error('Error importing project:', error);
          alert('Fichier invalide');
          resolve(null);
        }
      };
      reader.readAsText(file);
    });
  };

  return {
    loadProjects,
    saveCurrentProject,
    loadCurrentProject,
    deleteProject,
    renameProject,
    exportProject,
    importProject
  };
};
