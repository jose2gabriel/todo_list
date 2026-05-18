import { useState, useEffect } from 'react';
import { 
  Plus, 
  Moon, 
  Sun, 
  Menu, 
  LayoutGrid, 
  Settings as SettingsIcon,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  User
} from 'lucide-react';
import { cn } from './lib/utils';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

type Filter = 'Todas' | 'Ativas' | 'Concluídas';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<Filter>('Todas');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: input,
      completed: false
    };
    setTasks([newTask, ...tasks]);
    setInput('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditInput(task.text);
  };

  const saveEdit = () => {
    if (!editingId) return;
    setTasks(tasks.map(t => t.id === editingId ? { ...t, text: editInput } : t));
    setEditingId(null);
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'Ativas') return !t.completed;
    if (filter === 'Concluídas') return t.completed;
    return true;
  });

  const activeCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300">
      {/* Sidebar */}
      <aside className={cn(
        "bg-muted border-r border-border transition-all duration-300 flex flex-col",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-background/50 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {isSidebarOpen && (
          <div className="px-6 py-4 flex flex-col items-center border-b border-border mb-4">
            <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-4 overflow-hidden text-muted-foreground">
              <User className="w-8 h-8" />
            </div>
            <h2 className="font-semibold text-lg text-center">Usuário</h2>
            <p className="text-sm text-muted-foreground text-center">usuario@exemplo.com</p>
          </div>
        )}

        <nav className="flex-1 px-4 space-y-2">
          <button className={cn(
            "w-full flex items-center gap-4 p-3 rounded-xl bg-background shadow-sm border border-border transition-all",
            !isSidebarOpen && "justify-center"
          )}>
            <LayoutGrid className="w-5 h-5" />
            {isSidebarOpen && <span className="font-medium">My Tasks</span>}
          </button>
          <button className={cn(
            "w-full flex items-center gap-4 p-3 rounded-xl hover:bg-background/50 text-muted-foreground transition-all",
            !isSidebarOpen && "justify-center"
          )}>
            <SettingsIcon className="w-5 h-5" />
            {isSidebarOpen && <span className="font-medium">Configurações</span>}
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col items-center pt-20 px-4 relative">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="absolute top-6 right-6 p-2 hover:bg-muted rounded-full transition-colors"
        >
          {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>

        <div className="w-full max-w-2xl">
          <h1 className="text-4xl font-bold text-center mb-12">My Tasks</h1>

          {/* Task Input */}
          <form onSubmit={addTask} className="flex gap-2 mb-8">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua tarefa aqui..."
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>
            <button 
              type="submit"
              className="bg-accent text-accent-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Adicionar
            </button>
          </form>

          {/* Filters and Count */}
          <div className="flex items-center justify-between mb-6 text-sm">
            <div className="flex gap-4">
              {(['Todas', 'Ativas', 'Concluídas'] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "pb-1 transition-colors border-b-2",
                    filter === f ? "border-accent text-foreground font-semibold" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <span className="text-muted-foreground font-medium">
              {activeCount} {activeCount === 1 ? 'tarefa restante' : 'tarefas restantes'}
            </span>
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <div 
                  key={task.id}
                  className="group flex items-center gap-4 bg-muted border border-border p-4 rounded-2xl transition-all hover:shadow-md"
                >
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className="text-muted-foreground hover:text-accent transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-accent" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>
                  
                  {editingId === task.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={editInput}
                        onChange={(e) => setEditInput(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        className="flex-1 bg-background border border-border rounded-lg px-2 py-1 outline-none"
                      />
                    </div>
                  ) : (
                    <span className={cn(
                      "flex-1 text-lg transition-all",
                      task.completed && "text-muted-foreground line-through decoration-2"
                    )}>
                      {task.text}
                    </span>
                  )}

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEditing(task)}
                      className="p-2 hover:bg-background rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="p-2 hover:bg-background rounded-lg transition-colors text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-64 h-64 mb-6 opacity-80 dark:invert">
                  <img 
                    src="https://illustrations.popsy.co/gray/stuck-at-home.svg" 
                    alt="Estado vazio" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-muted-foreground max-w-xs">
                  Vazio como minha motivação na segunda-feira 😄.<br />
                  Vamos começar a adicionar coisas!
                </p>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-auto py-8 text-sm text-muted-foreground">
          © 2025
        </footer>
      </main>
    </div>
  );
}
