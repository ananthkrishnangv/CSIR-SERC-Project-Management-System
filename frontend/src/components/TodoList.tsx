import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import {
    AddRegular,
    CheckmarkCircleRegular,
    CircleRegular,
    DeleteRegular,
    CalendarRegular,
    FlagRegular,
    DismissRegular,
} from '@fluentui/react-icons';

interface Todo {
    id: string;
    title: string;
    description?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    dueDate?: string;
    completed: boolean;
    projectId?: string;
    projectCode?: string;
    createdAt: string;
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const priorityColors: Record<string, string> = {
    LOW: 'text-secondary-500',
    MEDIUM: 'text-primary-500',
    HIGH: 'text-warning-500',
    CRITICAL: 'text-danger-500',
};

const priorityBg: Record<string, string> = {
    LOW: 'bg-secondary-100',
    MEDIUM: 'bg-primary-100',
    HIGH: 'bg-warning-100',
    CRITICAL: 'bg-danger-100',
};

interface TodoListProps {
    compact?: boolean;
    projectId?: string;
}

export default function TodoList({ compact = false, projectId }: TodoListProps) {
    const { accessToken } = useAuthStore();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTodo, setNewTodo] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM' as Todo['priority'],
        dueDate: '',
        projectId: projectId || '',
    });

    useEffect(() => {
        fetchTodos();
    }, [projectId]);

    const fetchTodos = async () => {
        try {
            const url = projectId
                ? `${API_BASE}/todos?projectId=${projectId}`
                : `${API_BASE}/todos`;
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (res.ok) {
                const data = await res.json();
                setTodos(data.todos || data || []);
            } else {
                // Fallback to localStorage for demo
                const stored = localStorage.getItem('csir-todos');
                if (stored) setTodos(JSON.parse(stored));
            }
        } catch {
            const stored = localStorage.getItem('csir-todos');
            if (stored) setTodos(JSON.parse(stored));
        } finally {
            setLoading(false);
        }
    };

    const saveTodosLocal = (newTodos: Todo[]) => {
        localStorage.setItem('csir-todos', JSON.stringify(newTodos));
        setTodos(newTodos);
    };

    const handleAddTodo = async () => {
        if (!newTodo.title.trim()) return;

        const todo: Todo = {
            id: Date.now().toString(),
            title: newTodo.title,
            description: newTodo.description,
            priority: newTodo.priority,
            dueDate: newTodo.dueDate || undefined,
            completed: false,
            projectId: newTodo.projectId || undefined,
            createdAt: new Date().toISOString(),
        };

        try {
            const res = await fetch(`${API_BASE}/todos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(todo),
            });
            if (res.ok) {
                fetchTodos();
            } else {
                saveTodosLocal([todo, ...todos]);
            }
        } catch {
            saveTodosLocal([todo, ...todos]);
        }

        setNewTodo({ title: '', description: '', priority: 'MEDIUM', dueDate: '', projectId: projectId || '' });
        setShowAddModal(false);
    };

    const toggleComplete = async (id: string) => {
        const updatedTodos = todos.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
        );
        saveTodosLocal(updatedTodos);

        try {
            await fetch(`${API_BASE}/todos/${id}/toggle`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${accessToken}` },
            });
        } catch {
            // Already saved locally
        }
    };

    const deleteTodo = async (id: string) => {
        const updatedTodos = todos.filter(t => t.id !== id);
        saveTodosLocal(updatedTodos);

        try {
            await fetch(`${API_BASE}/todos/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` },
            });
        } catch {
            // Already saved locally
        }
    };

    const sortedTodos = [...todos].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    const incompleteTodos = sortedTodos.filter(t => !t.completed);
    const completedTodos = sortedTodos.filter(t => t.completed);

    if (loading) {
        return (
            <div className="space-y-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className="skeleton h-12 rounded-lg" />
                ))}
            </div>
        );
    }

    return (
        <div className={compact ? '' : 'premium-card p-6'}>
            {!compact && (
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-secondary-900">My Tasks</h3>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn-ghost text-sm flex items-center gap-1"
                    >
                        <AddRegular className="w-4 h-4" />
                        Add
                    </button>
                </div>
            )}

            {/* Todo Items */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
                {incompleteTodos.map(todo => (
                    <div
                        key={todo.id}
                        className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors group"
                    >
                        <button
                            onClick={() => toggleComplete(todo.id)}
                            className="mt-0.5 text-secondary-400 hover:text-success-500 transition-colors"
                        >
                            <CircleRegular className="w-5 h-5" />
                        </button>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-secondary-900">{todo.title}</p>
                            {todo.description && (
                                <p className="text-xs text-secondary-500 truncate">{todo.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${priorityBg[todo.priority]} ${priorityColors[todo.priority]}`}>
                                    <FlagRegular className="w-3 h-3" />
                                    {todo.priority}
                                </span>
                                {todo.dueDate && (
                                    <span className="inline-flex items-center gap-1 text-xs text-secondary-500">
                                        <CalendarRegular className="w-3 h-3" />
                                        {new Date(todo.dueDate).toLocaleDateString('en-IN')}
                                    </span>
                                )}
                                {todo.projectCode && (
                                    <span className="text-xs font-mono text-primary-600">{todo.projectCode}</span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => deleteTodo(todo.id)}
                            className="opacity-0 group-hover:opacity-100 text-secondary-400 hover:text-danger-500 transition-all"
                        >
                            <DeleteRegular className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {completedTodos.length > 0 && (
                    <div className="pt-2 border-t border-secondary-200 mt-2">
                        <p className="text-xs text-secondary-400 mb-2">Completed ({completedTodos.length})</p>
                        {completedTodos.slice(0, compact ? 3 : 5).map(todo => (
                            <div
                                key={todo.id}
                                className="flex items-center gap-3 p-2 rounded-lg opacity-60 group"
                            >
                                <button
                                    onClick={() => toggleComplete(todo.id)}
                                    className="text-success-500"
                                >
                                    <CheckmarkCircleRegular className="w-5 h-5" />
                                </button>
                                <p className="text-sm text-secondary-500 line-through flex-1">{todo.title}</p>
                                <button
                                    onClick={() => deleteTodo(todo.id)}
                                    className="opacity-0 group-hover:opacity-100 text-secondary-400 hover:text-danger-500"
                                >
                                    <DeleteRegular className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {todos.length === 0 && (
                    <div className="text-center py-8 text-secondary-500">
                        <p className="text-sm">No tasks yet</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="text-primary-600 text-sm hover:underline mt-1"
                        >
                            Add your first task
                        </button>
                    </div>
                )}
            </div>

            {/* Compact Add Button */}
            {compact && todos.length > 0 && (
                <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full mt-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                    + Add Task
                </button>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-premium-lg w-full max-w-md animate-scale-in">
                        <div className="flex items-center justify-between p-4 border-b border-secondary-100">
                            <h3 className="font-semibold text-secondary-900">Add New Task</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-secondary-400 hover:text-secondary-600">
                                <DismissRegular className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Task Title *</label>
                                <input
                                    type="text"
                                    className="input-premium"
                                    placeholder="What needs to be done?"
                                    value={newTodo.title}
                                    onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Description</label>
                                <textarea
                                    className="input-premium h-20 resize-none"
                                    placeholder="Additional details..."
                                    value={newTodo.description}
                                    onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">Priority</label>
                                    <select
                                        className="input-premium"
                                        value={newTodo.priority}
                                        onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as Todo['priority'] })}
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="CRITICAL">Critical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        className="input-premium"
                                        value={newTodo.dueDate}
                                        onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowAddModal(false)} className="btn-ghost flex-1">
                                    Cancel
                                </button>
                                <button onClick={handleAddTodo} className="btn-primary flex-1">
                                    Add Task
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
