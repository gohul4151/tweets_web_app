import { Trash2 } from 'lucide-react';
function Delete({ c_id, onDelete }) {
    async function delete_comment() {
        const res = await fetch(`http://localhost:3000/comment/${c_id}`, {
            method: "DELETE",
            credentials: "include"
        });
        const data = await res.json();
        console.log(data);
        if (res.ok && onDelete) {
            onDelete(c_id);
        }
    }
    return <>
        <button onClick={delete_comment}><Trash2 /></button>
    </>
}

export default Delete;
