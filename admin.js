const token = localStorage.getItem("token");

fetch(
    "https://backend-qai6.onrender.com/api/admin/dashboard",
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
)
.then(res => res.json())
.then(data => {

    console.log(data);

    document.getElementById("users").textContent =
        data.stats.totalUsers;

    document.getElementById("products").textContent =
        data.stats.totalProducts;

    document.getElementById("orders").textContent =
        data.stats.totalOrders;

    document.getElementById("messages").textContent =
        data.stats.totalMessages;

})
.catch(err => console.log(err));