import { Virtuoso } from 'react-virtuoso';
import { TaskItem } from '@/services/storage';
import { useAppStore } from '@/store/useAppStore';

import { ChevronDown, ChevronRight, Wand2 } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface TaskFeedProps {
    tasks: TaskItem[];
    onCubit: (taskId: string, taskName: string, desc: string) => void;
}

// Simple time formatter (MM:SS)
const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function TaskFeed({ tasks, onCubit }: TaskFeedProps) {
    // Virtualization requires fixed height or pure item rendering
    // We will render the whole page height for the feed eventually, 
    // but for now let's give it a container.

    return (
        <div className="h-full w-full bg-zinc-950">
            <Virtuoso
                style={{ height: 'calc(100vh - 80px)' }} // Subtract header height approx
                data={tasks}
                itemContent={(index, task) => <TaskRow task={task} onCubit={onCubit} />}
            />
        </div>
    );
}

function TaskRow({ task, onCubit }: { task: TaskItem, onCubit: (id: string, name: string, desc: string) => void }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="p-4 border-b border-zinc-900 hover:bg-zinc-900/50 transition-colors">
            <div className="flex gap-4 items-start">
                {/* Screenshot */}
                <div className="relative w-[120px] h-[67.5px] bg-zinc-800 rounded-md overflow-hidden flex-shrink-0 border border-zinc-700 shadow-sm">
                    {task.screenshot_base64 ? (
                        <Image
                            src={task.screenshot_base64}
                            alt={task.task_name}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500 animate-pulse">
                            Processing...
                        </div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
                        {formatTime(task.timestamp_seconds)}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-white font-medium truncate pr-2">{task.task_name}</h3>
                        <button
                            className="text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
                            onClick={() => onCubit(task.id, task.task_name, task.description)}
                        >
                            <Wand2 className="w-3 h-3" />
                            Cubit
                        </button>
                    </div>

                    <p className="text-sm text-zinc-400 line-clamp-2">{task.description}</p>

                    {/* Sub-steps Accordion Trigger */}
                    {task.sub_steps && task.sub_steps.length > 0 && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="mt-2 text-xs text-zinc-500 flex items-center gap-1 hover:text-zinc-300"
                        >
                            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            {task.sub_steps.length} Steps Generated
                        </button>
                    )}
                </div>
            </div>

            {/* Accordion Body */}
            {expanded && task.sub_steps && (
                <div className="mt-3 ml-[136px] bg-zinc-900/50 rounded-lg p-3 text-sm text-zinc-300 space-y-2 border border-zinc-800">
                    {task.sub_steps.map((step, idx) => (
                        <div key={idx} className="flex gap-2">
                            <span className="text-zinc-500 font-mono text-xs">{idx + 1}.</span>
                            <span>{step}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
