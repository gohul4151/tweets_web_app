function Username() {
    async function fetchUsername() {
        const response = await fetch("http://localhost:5000/getuserpost/${}");
        const data = await response.json();
        console.log(data);
    }
    return (
        <div>
            <h1>Username</h1>
        </div>
    );
}
export default Username;
