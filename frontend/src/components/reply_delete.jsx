import { Trash2 } from 'lucide-react';
function Reply_delete({ c_id, parentCommentId, onDelete }) {
    async function delete_reply() {
        const res = await fetch(`http://localhost:3000/comment/${c_id}`, {
            method: "DELETE",
            credentials: "include"
        });
        const data = await res.json();
        console.log(data);
        if (res.ok && onDelete) {
            onDelete(c_id, parentCommentId);
        }
    }
    return (
        <button onClick={delete_reply}><Trash2 size={14} /></button>
    )
}
export default Reply_delete;