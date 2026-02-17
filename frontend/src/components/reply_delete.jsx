import { Trash2 } from 'lucide-react';

function Reply_delete({ c_id, parentCommentId, onDelete }) {
    async function delete_reply() {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/comment/${c_id}`, {
                method: "DELETE",
                credentials: "include"
            });

            if (res.ok) {
                const data = await res.json();
                if (onDelete) {
                    onDelete(c_id, parentCommentId);
                }
            }
        } catch (error) {
            console.error("Error deleting reply:", error);
        }
    }

    return (
        <button
            onClick={delete_reply}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Delete reply"
        >
            <Trash2 size={12} />
        </button>
    );
}

export default Reply_delete;