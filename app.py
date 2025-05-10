 from flask import Flask
from flask_login import LoginManager
from config import Config
from models import db, User
from routes import api

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # 初始化扩展
    db.init_app(app)
    login_manager = LoginManager()
    login_manager.init_app(app)
    
    # 注册蓝图
    app.register_blueprint(api, url_prefix='/api')
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    # 创建数据库表
    with app.app_context():
        db.create_all()
    
    return app

def main():
    app = create_app()
    app.run(debug=True)

if __name__ == '__main__':
    main()