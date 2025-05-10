 from flask import Blueprint, jsonify, request
from models import db, User, MenuItem, Order, OrderItem
from flask_login import login_required, current_user

api = Blueprint('api', __name__)

@api.route('/menu', methods=['GET'])
def get_menu():
    """获取菜单列表"""
    menu_items = MenuItem.query.all()
    return jsonify([{
        'id': item.id,
        'name': item.name,
        'description': item.description,
        'price': item.price,
        'category': item.category,
        'image_url': item.image_url
    } for item in menu_items])

@api.route('/order', methods=['POST'])
@login_required
def create_order():
    """创建新订单"""
    data = request.get_json()
    items = data.get('items', [])
    
    if not items:
        return jsonify({'error': '订单不能为空'}), 400
    
    order = Order(user_id=current_user.id)
    total_amount = 0
    
    for item in items:
        menu_item = MenuItem.query.get(item['menu_item_id'])
        if not menu_item:
            return jsonify({'error': f'菜品ID {item["menu_item_id"]} 不存在'}), 404
        
        order_item = OrderItem(
            menu_item_id=menu_item.id,
            quantity=item['quantity'],
            price=menu_item.price
        )
        order.items.append(order_item)
        total_amount += menu_item.price * item['quantity']
    
    order.total_amount = total_amount
    db.session.add(order)
    db.session.commit()
    
    return jsonify({
        'order_id': order.id,
        'total_amount': total_amount,
        'status': order.status
    })

@api.route('/orders', methods=['GET'])
@login_required
def get_user_orders():
    """获取用户订单历史"""
    orders = Order.query.filter_by(user_id=current_user.id).all()
    return jsonify([{
        'id': order.id,
        'order_time': order.order_time.isoformat(),
        'status': order.status,
        'total_amount': order.total_amount,
        'items': [{
            'menu_item_name': item.menu_item.name,
            'quantity': item.quantity,
            'price': item.price
        } for item in order.items]
    } for order in orders])