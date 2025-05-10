// 全局变量
const API_BASE_URL = '/api';

// 工具函数
const formatPrice = (price) => {
    return `¥${price.toFixed(2)}`;
};

// 购物车管理
class ShoppingCart {
    constructor() {
        this.items = [];
        this.total = 0;
    }

    addItem(item) {
        const existingItem = this.items.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({...item, quantity: 1});
        }
        this.calculateTotal();
        this.updateUI();
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.calculateTotal();
        this.updateUI();
    }

    calculateTotal() {
        this.total = this.items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
    }

    updateUI() {
        // 更新购物车UI
        const cartElement = document.getElementById('cart');
        if (cartElement) {
            cartElement.innerHTML = this.items.map(item => `
                <div class="cart-item">
                    <span>${item.name}</span>
                    <span>${item.quantity}</span>
                    <span>${formatPrice(item.price * item.quantity)}</span>
                    <button onclick="cart.removeItem(${item.id})">删除</button>
                </div>
            `).join('');
        }
    }
}

// 初始化购物车
const cart = new ShoppingCart();

// API请求函数
async function fetchMenu() {
    try {
        const response = await fetch(`${API_BASE_URL}/menu`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取菜单失败:', error);
        return [];
    }
}

async function createOrder(orderData) {
    try {
        const response = await fetch(`${API_BASE_URL}/order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });
        return await response.json();
    } catch (error) {
        console.error('创建订单失败:', error);
        throw error;
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', async () => {
    // 加载菜单
    const menu = await fetchMenu();
    const menuElement = document.getElementById('menu');
    if (menuElement) {
        menuElement.innerHTML = menu.map(item => `
            <div class="menu-item card">
                <img src="${item.image_url}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <p class="price">${formatPrice(item.price)}</p>
                <button class="btn btn-primary" onclick="cart.addItem(${JSON.stringify(item)})">
                    加入购物车
                </button>
            </div>
        `).join('');
    }
}); 