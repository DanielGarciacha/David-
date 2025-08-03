from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_mysqldb import MySQL
import MySQLdb.cursors
import jwt
from datetime import datetime, timedelta, timezone

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Cambia esto a un secreto seguro

# Configuración de CORS para permitir solicitudes desde cualquier origen
CORS(app, resources={r"/*": {"origins": "*"}}, 
     supports_credentials=True, 
     expose_headers=['Content-Type', 'Authorization', 'Access-Control-Allow-Credentials'],
     allow_headers=['Content-Type', 'Authorization', 'Access-Control-Allow-Credentials'])

# Configuración de MySQL
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_PORT'] = 3306
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'emprendeu'
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'  # Cambia esto a un secreto seguro

mysql = MySQL(app)

TOKEN_EXPIRATION_MINUTES = 60  # Ajusta el tiempo de expiración del token

def get_role_id(role_name):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT id FROM roles WHERE name = %s', (role_name,))
    role = cursor.fetchone()
    cursor.close()
    return role['id'] if role else None

def get_user_id_from_token(auth_header):
    token = auth_header.split(' ')[1]
    decoded_token = jwt.decode(token, app.secret_key, algorithms=['HS256'])
    return decoded_token['user_id']

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    full_name = data.get('full_name')
    phone = data.get('phone')
    email = data.get('email')
    password = data.get('password')
    gender = data.get('gender')
    role_id = data.get('role_id', 3)  # Default to 'Usuario'

    if not all([full_name, phone, email, password, gender]):
        return jsonify({'message': 'Todos los campos son requeridos'}), 400

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM roles WHERE id = %s', (role_id,))
    role = cursor.fetchone()
    cursor.close()

    if role is None:
        return jsonify({'message': 'Rol inválido'}), 400

    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT id FROM usuarios WHERE email = %s', (email,))
        existing_user = cursor.fetchone()
        if existing_user:
            return jsonify({'message': 'El correo electrónico ya está registrado'}), 400

        cursor.execute('INSERT INTO usuarios (full_name, phone, email, password, gender, role_id) VALUES (%s, %s, %s, %s, %s, %s)',
                       (full_name, phone, email, password, gender, role_id))
        mysql.connection.commit()
        return jsonify({'message': 'Usuario registrado exitosamente'})
    except MySQLdb.Error as err:
        return jsonify({'message': f'Error de base de datos: {str(err)}'}), 500
    finally:
        cursor.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Correo y contraseña son requeridos'}), 400

    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('''
            SELECT u.*, r.name as role_name FROM usuarios u
            JOIN roles r ON u.role_id = r.id
            WHERE u.email = %s AND u.password = %s
        ''', (email, password))
        user = cursor.fetchone()

        if user:
            token = jwt.encode({
                'user_id': user['id'],
                'role_name': user['role_name'],
                'exp': datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRATION_MINUTES)
            }, app.secret_key, algorithm='HS256')

            return jsonify({
                'message': 'Inicio de sesión exitoso',
                'role_name': user['role_name'],
                'token': token
            })
        else:
            return jsonify({'message': 'Correo electrónico o contraseña inválidos'}), 401
    except MySQLdb.Error as err:
        return jsonify({'message': f'Error de base de datos: {str(err)}'}), 500
    finally:
        cursor.close()

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Cierre de sesión exitoso'})

@app.route('/api/user', methods=['GET'])
def get_user():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'message': 'Token no proporcionado'}), 401

    token = auth_header.split(' ')[1]

    try:
        decoded_token = jwt.decode(token, app.secret_key, algorithms=['HS256'])
        user_id = decoded_token['user_id']

        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('''
            SELECT u.id, u.full_name, u.email, r.name as role_name 
            FROM usuarios u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = %s
        ''', (user_id,))
        user = cursor.fetchone()

        if user:
            return jsonify(user)
        else:
            return jsonify({'message': 'Usuario no encontrado'}), 404
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Token inválido'}), 401
    except MySQLdb.Error as err:
        return jsonify({'message': f'Error de base de datos: {str(err)}'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()

@app.route('/api/usuarios', methods=['GET'])
def get_usuarios():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'message': 'Token no proporcionado'}), 401

    token = auth_header.split(' ')[1]

    try:
        decoded_token = jwt.decode(token, app.secret_key, algorithms=['HS256'])

        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('''
            SELECT u.id, u.full_name, u.phone, u.email, u.gender, r.name as role_name
            FROM usuarios u
            JOIN roles r ON u.role_id = r.id
        ''')
        usuarios = cursor.fetchall()

        admins = [user for user in usuarios if user['role_name'] == 'Administrador']
        soportes = [user for user in usuarios if user['role_name'] == 'Soporte']
        usuarios_regulares = [user for user in usuarios if user['role_name'] == 'Usuario']

        return jsonify({
            'admins': admins,
            'soportes': soportes,
            'usuarios': usuarios_regulares
        })
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Token inválido'}), 401
    except MySQLdb.Error as err:
        return jsonify({'message': f'Error de base de datos: {str(err)}'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()

@app.route('/api/usuarios/<int:user_id>', methods=['DELETE'])
def delete_usuario(user_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'message': 'Token no proporcionado'}), 401

    token = auth_header.split(' ')[1]

    try:
        decoded_token = jwt.decode(token, app.secret_key, algorithms=['HS256'])
        if decoded_token['role_name'] != 'Administrador':
            return jsonify({'message': 'No tienes permisos para eliminar usuarios'}), 403

        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('''
            INSERT INTO usuarios_eliminados (full_name, phone, email, password, gender, role_id, deleted_at)
            SELECT full_name, phone, email, password, gender, role_id, NOW() 
            FROM usuarios WHERE id = %s
        ''', (user_id,))

        cursor.execute('DELETE FROM usuarios WHERE id = %s', (user_id,))
        
        mysql.connection.commit()
        return jsonify({'message': 'Usuario eliminado exitosamente'})
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Token inválido'}), 401
    except MySQLdb.Error as err:
        return jsonify({'message': f'Error de base de datos: {str(err)}'}), 500
    finally:
        cursor.close()

@app.route('/api/usuarios/<int:user_id>/role', methods=['PUT'])
def update_usuario_role(user_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'message': 'Token no proporcionado'}), 401

    token = auth_header.split(' ')[1]

    try:
        decoded_token = jwt.decode(token, app.secret_key, algorithms=['HS256'])
        if decoded_token['role_name'] != 'Administrador':
            return jsonify({'message': 'No tienes permisos para editar roles'}), 403

        data = request.json
        new_role_name = data.get('role_name')
        new_role_id = get_role_id(new_role_name)

        if not new_role_id:
            return jsonify({'message': 'Rol no encontrado'}), 400

        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('''
            UPDATE usuarios SET role_id = %s WHERE id = %s
        ''', (new_role_id, user_id))
        mysql.connection.commit()

        return jsonify({'message': 'Rol de usuario actualizado exitosamente'})
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Token inválido'}), 401
    except MySQLdb.Error as err:
        return jsonify({'message': f'Error de base de datos: {str(err)}'}), 500
    finally:
        cursor.close()

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'message': 'Token no proporcionado'}), 401

    token = auth_header.split(' ')[1]

    try:
        jwt.decode(token, app.secret_key, algorithms=['HS256'])

        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Total de productos
        cursor.execute('SELECT COUNT(*) AS count FROM productos')
        total_products = cursor.fetchone()['count']

        # Total de órdenes
        cursor.execute('SELECT COUNT(*) AS count FROM ordenes')
        total_orders = cursor.fetchone()['count']

        # Total de ventas
        cursor.execute('SELECT SUM(total) AS total_sales FROM ordenes')
        total_sales = cursor.fetchone()['total_sales'] or 0

        # Productos registrados en los últimos 30 días
        cursor.execute('''
            SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
            FROM productos
            WHERE created_at >= CURDATE() - INTERVAL 30 DAY
            GROUP BY month
        ''')
        recent_products_by_month = cursor.fetchall()

        # Usuarios registrados en los últimos 30 días
        cursor.execute('''
            SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
            FROM usuarios
            WHERE created_at >= CURDATE() - INTERVAL 30 DAY
            GROUP BY month
        ''')
        recent_users_by_month = cursor.fetchall()

        return jsonify({
            'total_products': total_products,
            'total_orders': total_orders,
            'total_sales': total_sales,
            'recent_products_by_month': recent_products_by_month,
            'recent_users_by_month': recent_users_by_month
        })
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Token inválido'}), 401
    except MySQLdb.Error as err:
        return jsonify({'message': f'Error de base de datos: {str(err)}'}), 500
    finally:
        cursor.close()

# Ruta para obtener productos
@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM productos')
        products = cursor.fetchall()
        cursor.close()
        return jsonify(products), 200
    except MySQLdb.Error as err:
        return jsonify({'message': f'Error de base de datos: {str(err)}'}), 500


# Ruta para ordenar un producto
@app.route('/api/products/order', methods=['POST'])
def order_product():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'message': 'Token no proporcionado'}), 401

    try:
        user_id = get_user_id_from_token(auth_header)
        data = request.json
        product_id = data.get('product_id')

        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT price FROM productos WHERE id = %s', (product_id,))
        product = cursor.fetchone()

        if not product:
            return jsonify({'message': 'Producto no encontrado'}), 404

        total = product['price']

        cursor.execute('''
            INSERT INTO ordenes (user_id, product_id, cantidad, total)
            VALUES (%s, %s, %s, %s)
        ''', (user_id, product_id, 1, total))

        mysql.connection.commit()
        return jsonify({'message': 'Producto ordenado exitosamente'})
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Token inválido'}), 401
    except MySQLdb.Error as err:
        return jsonify({'message': f'Error de base de datos: {str(err)}'}), 500
    finally:
        cursor.close()

# Ruta para apartar un producto
@app.route('/api/products/apart', methods=['POST'])
def apart_product():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'message': 'Token no proporcionado'}), 401

    try:
        user_id = get_user_id_from_token(auth_header)
        data = request.json
        product_id = data.get('product_id')

        # Aquí puedes implementar la lógica para apartar el producto, por ejemplo, reducir la disponibilidad temporalmente

        return jsonify({'message': 'Producto apartado exitosamente'})
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Token inválido'}), 401

# Ruta para verificar el token
@app.route('/api/verify-token', methods=['POST'])
def verify_token():
    data = request.json
    token = data.get('token')

    try:
        decoded = jwt.decode(token, app.secret_key, algorithms=['HS256'])
        return jsonify({'valid': True, 'role': decoded['role_name']})
    except jwt.ExpiredSignatureError:
        return jsonify({'valid': False, 'message': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'valid': False, 'message': 'Token inválido'}), 401

# Ruta para extender la sesión
@app.route('/api/extend-session', methods=['POST'])
def extend_session():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'message': 'Token no proporcionado'}), 401

    token = auth_header.split(' ')[1]

    try:
        decoded_token = jwt.decode(token, app.secret_key, algorithms=['HS256'], options={"verify_exp": False})
        user_id = decoded_token['user_id']
        role_name = decoded_token['role_name']

        new_token = jwt.encode({
            'user_id': user_id,
            'role_name': role_name,
            'exp': datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRATION_MINUTES)
        }, app.secret_key, algorithm='HS256')

        return jsonify({'token': new_token})
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Token inválido'}), 401

@app.route('/api/support/orders', methods=['GET'])
def get_support_orders():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'message': 'Token no proporcionado'}), 401

    token = auth_header.split(' ')[1]

    try:
        jwt.decode(token, app.secret_key, algorithms=['HS256'])

        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('''
            SELECT o.id, o.cantidad, o.total, p.name as product_name 
            FROM ordenes o
            JOIN productos p ON o.product_id = p.id
        ''')
        orders = cursor.fetchall()

        return jsonify(orders)
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Token inválido'}), 401
    except MySQLdb.Error as err:
        return jsonify({'message': f'Error de base de datos: {str(err)}'}), 500
    finally:
        cursor.close()


if __name__ == '__main__':
    app.run()