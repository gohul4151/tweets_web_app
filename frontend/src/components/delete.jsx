import { Trash2 } from 'lucide-react';

function Delete({ c_id, onDelete }) {
    async function delete_comment() {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/comment/${c_id}`, {
                method: "DELETE",
                credentials: "include"
            });

            if (res.ok) {
                const data = await res.json();
                console.log(data);
                if (onDelete) {
                    onDelete(c_id);
                }
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    }

    return (
        <button
            onClick={delete_comment}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Delete comment"
        >
            <Trash2 size={14} />
        </button>
    );
}

export default Delete;

