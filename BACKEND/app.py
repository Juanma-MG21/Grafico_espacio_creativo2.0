from flask import Flask, flash, redirect, url_for, render_template, request, session, jsonify
from flask_cors import CORS
import mysql.connector
from flask_session import Session
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os

# import cloudinary
# import cloudinary.uploader


# cloudinary.config(
#     cloud_name="TU_CLOUD_NAME",
#     api_key="TU_API_KEY",
#     api_secret="TU_API_SECRET",
#     secure=True
# )




app = Flask(__name__)

# Permite que React (Vite en :5173) hable con Flask (:5000)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

app.secret_key = 'clave_secreta'
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

basedir = os.path.abspath(os.path.dirname(__file__))

UPLOAD_FOLDER = os.path.join(basedir, 'static', 'uploads')
SECUNDARIAS_FOLDER = os.path.join(UPLOAD_FOLDER, 'secundarias')


ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SECUNDARIAS_FOLDER'] = SECUNDARIAS_FOLDER


os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(SECUNDARIAS_FOLDER, exist_ok=True)

import mysql.connector

# Diccionario de configuración
db_config = {
    'host': 'localhost',
    'user': 'arcadia_user',
    'password': 'password',
    'database': 'Espaciocreativo$Arcadia',
    'charset': 'utf8mb4'
}



# Función que usa ese diccionario
def conectar_db():
    return mysql.connector.connect(**db_config)


db_connection = mysql.connector.connect(**db_config)
cursor = db_connection.cursor()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_db_connection():
    return mysql.connector.connect(**db_config)



# ----------------------------------------------------------------------


# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# = = = > pagina principal < = = =
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
@app.route('/')
def index():
    return render_template('index.html')

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# = = = > CONTACTENOS < = = =
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
@app.route('/contacto')
def contacto():
    return render_template('contacto.html')


# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# = = = > SOBRE MI < = = =
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
@app.route('/aboutme')
def aboutme():
    return render_template('aboutme.html')

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# = = = > SUBIR OBRAS < = = =
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
@app.route('/artic', methods=['GET', 'POST'])
def agregar_obra():
    if request.method == 'POST':
        def convertir_a_float(valor):
            return float(valor) if valor.strip() else None

        # Obtener campos del formulario
        titulo = request.form['titulo']
        descripcion = request.form['descripcion']
        materiales = request.form['materiales']
        medidas_largo = convertir_a_float(request.form['medidas_largo'])
        medidas_ancho = convertir_a_float(request.form['medidas_ancho'])
        medidas_alto = convertir_a_float(request.form['medidas_alto'])
        categoria = request.form['categoria']

        # Validar imagen principal
        if 'imagen_principal' not in request.files:
            return "Error: No se encontró la imagen principal"

        file = request.files['imagen_principal']
        if file.filename == '' or not allowed_file(file.filename):
            return "Error: Imagen principal inválida"

        # Conexión a base de datos
        conexion = conectar_db()
        cursor = conexion.cursor()

        # Insertar obra sin imagen (la agregamos luego)
        sql_obra = """
            INSERT INTO obras (
                titulo, descripcion, materiales,
                medidas_largo, medidas_ancho, medidas_alto,
                imagen_principal, categoria
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        valores_obra = (
            titulo, descripcion, materiales,
            medidas_largo, medidas_ancho, medidas_alto,
            '', categoria
        )
        cursor.execute(sql_obra, valores_obra)
        obra_id = cursor.lastrowid

        # Guardar imagen principal
        filename = secure_filename(f"obra_{obra_id}_" + file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Actualizar nombre del archivo en la base de datos
        cursor.execute(
            "UPDATE obras SET imagen_principal = %s WHERE id = %s",
            (filename, obra_id)
        )

        # Guardar imágenes secundarias si existen
        if 'imagenes_secundarias' in request.files:
            for archivo in request.files.getlist('imagenes_secundarias'):
                if archivo and allowed_file(archivo.filename):
                    filename_sec = secure_filename(f"obra_{obra_id}_" + archivo.filename)
                    filepath_sec = os.path.join(app.config['SECUNDARIAS_FOLDER'], filename_sec)
                    archivo.save(filepath_sec)

                    cursor.execute(
                        "INSERT INTO imagenes_obras (obra_id, imagen_url) VALUES (%s, %s)",
                        (obra_id, filename_sec)
                    )

        # Finalizar
        conexion.commit()
        cursor.close()
        conexion.close()

        return redirect(url_for('obtener_obras'))

    return render_template('artic.html')


# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# = = = > ELIMINAR OBRAS < = = =
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
@app.route('/eliminar_obra/<int:obra_id>', methods=['POST'])
def eliminar_obra(obra_id):
    conexion = conectar_db()
    cursor = conexion.cursor()

    # Obtener nombre de la imagen principal
    cursor.execute("SELECT imagen_principal FROM obras WHERE id = %s", (obra_id,))
    resultado = cursor.fetchone()
    if resultado:
        imagen_principal = resultado[0]
        ruta_imagen = os.path.join(app.config['UPLOAD_FOLDER'], imagen_principal)
        if os.path.exists(ruta_imagen):
            os.remove(ruta_imagen)

    # Obtener imágenes secundarias y eliminarlas
    cursor.execute("SELECT imagen_url FROM imagenes_obras WHERE obra_id = %s", (obra_id,))
    imagenes_secundarias = cursor.fetchall()
    for img_sec in imagenes_secundarias:
        ruta_secundaria = os.path.join(app.config['SECUNDARIAS_FOLDER'], img_sec[0])
        if os.path.exists(ruta_secundaria):
            os.remove(ruta_secundaria)

    # Eliminar de la base de datos
    cursor.execute("DELETE FROM imagenes_obras WHERE obra_id = %s", (obra_id,))
    cursor.execute("DELETE FROM obras WHERE id = %s", (obra_id,))
    conexion.commit()
    cursor.close()
    conexion.close()

    return redirect(url_for('obtener_obras'))  # o el nombre correcto de tu ruta a obras.html


# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# = = = > ACTUALIZAR OBRAS < = = =
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
def convertir_a_float(valor):
    return float(valor) if valor and valor.strip() else None

@app.route('/actualizar/<int:obra_id>', methods=['GET', 'POST'])
def actualizar_obra(obra_id):
    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    if request.method == 'POST':
        # 1. Obtener datos del formulario
        titulo = request.form.get('titulo')
        descripcion = request.form.get('descripcion')
        materiales = request.form.get('materiales')
        medidas_largo = convertir_a_float(request.form.get('medidas_largo'))
        medidas_ancho = convertir_a_float(request.form.get('medidas_ancho'))
        medidas_alto = convertir_a_float(request.form.get('medidas_alto'))


        # 2. Actualizar datos básicos
        cursor.execute("""
            UPDATE obras
            SET titulo = %s, descripcion = %s, materiales = %s,
                medidas_largo = %s, medidas_ancho = %s, medidas_alto = %s
            WHERE id = %s
        """, (titulo, descripcion, materiales, medidas_largo, medidas_ancho, medidas_alto, obra_id))

        # 3. Actualizar imagen principal (si hay nueva)
        if 'imagen_principal' in request.files:
            nueva_imagen = request.files['imagen_principal']
            if nueva_imagen and nueva_imagen.filename != '':
                # Eliminar anterior
                cursor.execute("SELECT imagen_principal FROM obras WHERE id = %s", (obra_id,))
                anterior = cursor.fetchone()
                if anterior and anterior['imagen_principal']:
                    ruta_ant = os.path.join(app.config['UPLOAD_FOLDER'], anterior['imagen_principal'])
                    if os.path.exists(ruta_ant):
                        os.remove(ruta_ant)

                # Guardar nueva
                filename = secure_filename(nueva_imagen.filename)
                nueva_imagen.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                cursor.execute("UPDATE obras SET imagen_principal = %s WHERE id = %s", (filename, obra_id))

        # 4. Eliminar imágenes secundarias marcadas
        ids_a_eliminar = request.form.get('eliminar_secundarias')
        if ids_a_eliminar:
            ids = ids_a_eliminar.split(',')
            for img_id in ids:
                if img_id.strip():
                    cursor.execute("SELECT imagen_url FROM imagenes_obras WHERE id = %s", (img_id,))
                    img = cursor.fetchone()
                    if img and img['imagen_url']:
                        ruta = os.path.join(app.config['SECUNDARIAS_FOLDER'], img['imagen_url'])
                        if os.path.exists(ruta):
                            os.remove(ruta)
                    cursor.execute("DELETE FROM imagenes_obras WHERE id = %s", (img_id,))

        # 5. Agregar nuevas imágenes secundarias
        if 'nuevas_secundarias' in request.files:
            nuevas_imgs = request.files.getlist('nuevas_secundarias')
            for img in nuevas_imgs:
                if img and img.filename != '':
                    filename = secure_filename(img.filename)
                    img.save(os.path.join(app.config['SECUNDARIAS_FOLDER'], filename))
                    cursor.execute("INSERT INTO imagenes_obras (obra_id, imagen_url) VALUES (%s, %s)", (obra_id, filename))

        conexion.commit()
        cursor.close()
        conexion.close()

        return redirect(url_for('obtener_obras'))

    # Si es GET, renderiza el formulario con los datos actuales
    cursor.execute("SELECT * FROM obras WHERE id = %s", (obra_id,))
    obra = cursor.fetchone()

    cursor.execute("SELECT * FROM imagenes_obras WHERE obra_id = %s", (obra_id,))
    imagenes_secundarias = cursor.fetchall()

    cursor.close()
    conexion.close()

    return render_template("actualizar_obra.html", obra=obra, imagenes_secundarias=imagenes_secundarias)


# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# = = = > IMAGENES SECUNDARIAS < = = =
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
@app.route('/imagenes_secundarias/<int:obra_id>')
def obtener_imagenes_secundarias(obra_id):
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("SELECT imagen_url FROM imagenes_obras WHERE obra_id = %s", (obra_id,))
    imagenes = cursor.fetchall()
    cursor.close()
    conexion.close()

    rutas = [url_for('static', filename=f'uploads/secundarias/{img[0]}') for img in imagenes]
    return jsonify(rutas)


# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# = = = > GALERIA < = = =
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
@app.route('/obras')
def obtener_obras():
    if 'logged_in' in session and session.get('rol') == 1:
        conexion = conectar_db()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT * FROM obras")
        obras = cursor.fetchall()
        cursor.close()
        conexion.close()
        return render_template('obras.html', obras=obras)
    else:
        flash('No tienes permiso para acceder a esta página.', 'danger')
        return redirect(url_for('index'))


# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# = = = > TRABAJOS - categorias < = = =
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
@app.route("/trabajos")
def trabajos():
    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)
    cursor.execute("SELECT * FROM obras")
    obras = cursor.fetchall()
    cursor.close()
    conexion.close()
    return render_template("trabajos.html", obras=obras)
# ----------------------------------------------------------------------


# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# = = = > REGISTRO_USUARIOS < = = =
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
@app.route('/registrarse', methods=['GET', 'POST'])
def registrarse():
    if request.method == 'POST':
        nombre = request.form['nombre']
        apellido = request.form['apellido']
        telefono = request.form['telefono']
        email = request.form['email']
        contrasena = request.form['contrasena']

        if not nombre or not email or not apellido or not contrasena:
            flash('Todos los campos son obligatorios.', 'danger')
            return redirect(url_for('registrarse'))

        # Asignación automática de rol
        if email == 'juanma1608g@gmail.com':
            rol = 1
        else:
            rol = 0

        conexion = conectar_db()
        cursor = conexion.cursor()

        try:
            # Verificar si el correo ya está registrado
            cursor.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
            if cursor.fetchone():
                flash('El email ya está registrado.', 'danger')
                return redirect(url_for('registrarse'))

            hashed_password = generate_password_hash(contrasena)

            # Insertar usuario con rol incluido
            cursor.execute(
                "INSERT INTO usuarios (nombre, apellido, telefono, email, contrasena, rol) VALUES (%s, %s, %s, %s, %s, %s)",
                (nombre, apellido, telefono, email, hashed_password, rol)
            )
            conexion.commit()
            flash('Usuario registrado correctamente.', 'success')
            return redirect(url_for('login'))

        except Exception as e:
            conexion.rollback()
            flash('Error al registrar usuario: ' + str(e), 'danger')
        finally:
            cursor.close()
            conexion.close()

    return render_template('registrarse.html')


# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# = = = > USER_ADMIN < = = =
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
@app.route('/usuarios')
def usuarios():
    if 'logged_in' in session and session.get ('rol') == 1:
        try:
            conn = mysql.connector.connect(**db_config)
            cursor = conn.cursor(dictionary=True)
            cursor.execute('SELECT * FROM usuarios')
            usuarios = cursor.fetchall()
        except mysql.connector.Error as err:
            flash(f'Error al obtener los usuarios: {err}', 'danger')
            usuarios=[]
        finally:
            cursor.close()
            conn.close()

        return render_template('usuarios.html', usuarios=usuarios)
    else:
        flash('no tienes permiso para acceder a esta pagina', 'danger')
        return redirect(url_for('index'))


# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# = = = > ACTUALIZAR_USER < = = =
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
@app.route('/actualizar_usuario/<int:id>', methods=['GET', 'POST'])
def actualizar_usuario(id):
    if 'logged_in' in session and session.get('rol') == 1:
        conexion = conectar_db()
        cursor = conexion.cursor(dictionary=True)

        if request.method == 'POST':
            nombre = request.form['nombre']
            apellido = request.form['apellido']
            telefono = request.form['telefono']
            email = request.form['email']
            contrasena = request.form['contrasena']

            if contrasena:
                hash_contra = generate_password_hash(contrasena)
                cursor.execute("""
                    UPDATE usuarios
                    SET nombre = %s, apellido = %s, telefono = %s, email = %s, contrasena = %s
                    WHERE id = %s
                """, (nombre, apellido, telefono, email, hash_contra, id))
            else:
                cursor.execute("""
                    UPDATE usuarios
                    SET nombre = %s, apellido = %s, telefono = %s, email = %s
                    WHERE id = %s
                """, (nombre, apellido, email, id))

            conexion.commit()
            cursor.close()
            conexion.close()
            flash('Usuario actualizado correctamente.', 'success')
            return redirect(url_for('usuarios'))

        cursor.execute("SELECT * FROM usuarios WHERE id = %s", (id,))
        usuario = cursor.fetchone()
        cursor.close()
        conexion.close()
        return render_template('actualizar_usuario.html', usuario=usuario)

    else:
        flash('No tienes permiso para acceder a esta página', 'danger')
        return redirect(url_for('index'))


# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# = = = > ELIMINAR_USER < = = =
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
@app.route('/eliminar_usuario/<int:id>', methods=['POST'])
def eliminar_usuario(id):
    if 'logged_in' in session and session.get('rol') == 1:
        try:
            conexion = conectar_db()
            cursor = conexion.cursor()
            cursor.execute("DELETE FROM usuarios WHERE id = %s", (id,))
            conexion.commit()
            flash('Usuario eliminado correctamente.', 'warning')
        except Exception as e:
            flash(f'Error al eliminar usuario: {e}', 'danger')
        finally:
            cursor.close()
            conexion.close()
    else:
        flash('No tienes permiso para realizar esta acción.', 'danger')

    return redirect(url_for('index'))


# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# = = = > LOGIN < = = =
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
@app.route('/login', methods=['GET', 'POST'])
def login():
    conn = None
    cursor = None
    if request.method == 'POST':
        nombre = request.form['nombre']
        email = request.form['email']
        contrasena = request.form['contrasena']

        try:
            conn = mysql.connector.connect(**db_config)
            cursor = conn.cursor(dictionary=True)
            cursor.execute('SELECT * FROM usuarios WHERE nombre=%s AND email=%s', (nombre, email))
            usuario = cursor.fetchone()

            if usuario and check_password_hash(usuario['contrasena'], contrasena):
                session['logged_in'] = True
                session['username'] = usuario['nombre']
                session['useremail'] = usuario['email']
                session['rol'] = usuario['rol']
                session['user_id'] = usuario['id']  # Agregado para almacenar el ID del usuario
                flash('Inicio de sesión exitoso', 'success')
                return redirect(url_for('index'))
            else:
                return "Credenciales incorrectas. Inténtalo de nuevo."

        except mysql.connector.Error as err:
            flash(f'Error en el inicio de sesión: {err}', 'danger')

        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    return render_template('login.html')


# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# = = = > LOGOUT < = = =
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    session.pop('username', None)
    session.pop('useremail', None)
    session.pop('rol', None)
    flash('Has cerrado sesión exitosamente', 'success')
    return redirect(url_for('index'))

# ======================================================================
# = = = > API JSON para React < = = =
# Estas rutas son exclusivas para el frontend React.
# No tocan la logica existente, solo devuelven JSON.
# ======================================================================

# Sesion: React consulta si hay admin logueado
@app.route('/api/session')
def api_session():
    return jsonify({
        'logged_in': session.get('logged_in', False),
        'username':  session.get('username', None),
        'rol':       session.get('rol', None),
        'user_id':   session.get('user_id', None),
    })

# Login desde React
@app.route('/api/login', methods=['POST'])
def api_login():
    data       = request.get_json()
    nombre     = data.get('nombre')
    email      = data.get('email')
    contrasena = data.get('contrasena')
    conn = None
    cursor = None
    try:
        conn   = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM usuarios WHERE nombre=%s AND email=%s', (nombre, email))
        usuario = cursor.fetchone()
        if usuario and check_password_hash(usuario['contrasena'], contrasena):
            session['logged_in'] = True
            session['username']  = usuario['nombre']
            session['useremail'] = usuario['email']
            session['rol']       = usuario['rol']
            session['user_id']   = usuario['id']
            return jsonify({'ok': True, 'rol': usuario['rol'], 'username': usuario['nombre']})
        else:
            return jsonify({'ok': False, 'error': 'Credenciales incorrectas'}), 401
    except mysql.connector.Error as err:
        return jsonify({'ok': False, 'error': str(err)}), 500
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()

# Logout desde React
@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({'ok': True})

# Registro desde React
@app.route('/api/registrarse', methods=['POST'])
def api_registrarse():
    data       = request.get_json()
    nombre     = data.get('nombre')
    apellido   = data.get('apellido')
    telefono   = data.get('telefono')
    email      = data.get('email')
    contrasena = data.get('contrasena')
    if not all([nombre, apellido, email, contrasena]):
        return jsonify({'ok': False, 'error': 'Todos los campos son obligatorios'}), 400
    rol = 1 if email == 'juanma1608g@gmail.com' else 0
    try:
        conexion = conectar_db()
        cursor   = conexion.cursor()
        cursor.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({'ok': False, 'error': 'El email ya esta registrado'}), 409
        hashed = generate_password_hash(contrasena)
        cursor.execute(
            "INSERT INTO usuarios (nombre, apellido, telefono, email, contrasena, rol) VALUES (%s,%s,%s,%s,%s,%s)",
            (nombre, apellido, telefono, email, hashed, rol)
        )
        conexion.commit()
        return jsonify({'ok': True})
    except Exception as e:
        conexion.rollback()
        return jsonify({'ok': False, 'error': str(e)}), 500
    finally:
        cursor.close()
        conexion.close()

# Obras: lista publica (sin login necesario)
@app.route('/api/obras')
def api_obras():
    conexion = conectar_db()
    cursor   = conexion.cursor(dictionary=True)
    cursor.execute("SELECT * FROM obras")
    obras = cursor.fetchall()
    cursor.close()
    conexion.close()
    for o in obras:
        for campo in ['medidas_ancho', 'medidas_largo', 'medidas_alto']:
            if o.get(campo) is not None:
                o[campo] = float(o[campo])
    return jsonify(obras)

# Imagenes secundarias de una obra
@app.route('/api/imagenes_secundarias/<int:obra_id>')
def api_imagenes_secundarias(obra_id):
    conexion = conectar_db()
    cursor   = conexion.cursor()
    cursor.execute("SELECT imagen_url FROM imagenes_obras WHERE obra_id = %s", (obra_id,))
    imagenes = cursor.fetchall()
    cursor.close()
    conexion.close()
    rutas = [f"/static/uploads/secundarias/{img[0]}" for img in imagenes]
    return jsonify(rutas)

# Eliminar obra (solo admin)
@app.route('/api/eliminar_obra/<int:obra_id>', methods=['DELETE'])
def api_eliminar_obra(obra_id):
    if not (session.get('logged_in') and session.get('rol') == 1):
        return jsonify({'ok': False, 'error': 'No autorizado'}), 403
    conexion = conectar_db()
    cursor   = conexion.cursor()
    cursor.execute("SELECT imagen_principal FROM obras WHERE id = %s", (obra_id,))
    resultado = cursor.fetchone()
    if resultado:
        ruta = os.path.join(app.config['UPLOAD_FOLDER'], resultado[0])
        if os.path.exists(ruta): os.remove(ruta)
    cursor.execute("SELECT imagen_url FROM imagenes_obras WHERE obra_id = %s", (obra_id,))
    for img in cursor.fetchall():
        ruta_sec = os.path.join(app.config['SECUNDARIAS_FOLDER'], img[0])
        if os.path.exists(ruta_sec): os.remove(ruta_sec)
    cursor.execute("DELETE FROM imagenes_obras WHERE obra_id = %s", (obra_id,))
    cursor.execute("DELETE FROM obras WHERE id = %s", (obra_id,))
    conexion.commit()
    cursor.close()
    conexion.close()
    return jsonify({'ok': True})

# Subir obra nueva (solo admin)
@app.route('/api/artic', methods=['POST'])
def api_agregar_obra():
    if not (session.get('logged_in') and session.get('rol') == 1):
        return jsonify({'ok': False, 'error': 'No autorizado'}), 403
    def to_float(v):
        return float(v) if v and str(v).strip() else None
    titulo        = request.form.get('titulo')
    descripcion   = request.form.get('descripcion')
    materiales    = request.form.get('materiales')
    medidas_largo = to_float(request.form.get('medidas_largo', ''))
    medidas_ancho = to_float(request.form.get('medidas_ancho', ''))
    medidas_alto  = to_float(request.form.get('medidas_alto', ''))
    categoria     = request.form.get('categoria')
    if 'imagen_principal' not in request.files:
        return jsonify({'ok': False, 'error': 'Falta imagen principal'}), 400
    file = request.files['imagen_principal']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'ok': False, 'error': 'Imagen invalida'}), 400
    conexion = conectar_db()
    cursor   = conexion.cursor()
    cursor.execute(
        "INSERT INTO obras (titulo, descripcion, materiales, medidas_largo, medidas_ancho, medidas_alto, imagen_principal, categoria) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
        (titulo, descripcion, materiales, medidas_largo, medidas_ancho, medidas_alto, '', categoria)
    )
    obra_id  = cursor.lastrowid
    filename = secure_filename(f"obra_{obra_id}_" + file.filename)
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    cursor.execute("UPDATE obras SET imagen_principal = %s WHERE id = %s", (filename, obra_id))
    if 'imagenes_secundarias' in request.files:
        for archivo in request.files.getlist('imagenes_secundarias'):
            if archivo and allowed_file(archivo.filename):
                fn = secure_filename(f"obra_{obra_id}_" + archivo.filename)
                archivo.save(os.path.join(app.config['SECUNDARIAS_FOLDER'], fn))
                cursor.execute("INSERT INTO imagenes_obras (obra_id, imagen_url) VALUES (%s,%s)", (obra_id, fn))
    conexion.commit()
    cursor.close()
    conexion.close()
    return jsonify({'ok': True, 'id': obra_id})

# Obtener datos de una obra para editar (solo admin)
@app.route('/api/obra/<int:obra_id>')
def api_obtener_obra(obra_id):
    if not (session.get('logged_in') and session.get('rol') == 1):
        return jsonify({'ok': False, 'error': 'No autorizado'}), 403
    conexion = conectar_db()
    cursor   = conexion.cursor(dictionary=True)
    cursor.execute("SELECT * FROM obras WHERE id = %s", (obra_id,))
    obra = cursor.fetchone()
    cursor.execute("SELECT * FROM imagenes_obras WHERE obra_id = %s", (obra_id,))
    secundarias = cursor.fetchall()
    cursor.close()
    conexion.close()
    if not obra:
        return jsonify({'ok': False, 'error': 'Obra no encontrada'}), 404
    for campo in ['medidas_ancho', 'medidas_largo', 'medidas_alto']:
        if obra.get(campo) is not None:
            obra[campo] = float(obra[campo])
    return jsonify({'obra': obra, 'secundarias': secundarias})

# Actualizar obra existente (solo admin)
@app.route('/api/actualizar/<int:obra_id>', methods=['POST'])
def api_actualizar_obra(obra_id):
    if not (session.get('logged_in') and session.get('rol') == 1):
        return jsonify({'ok': False, 'error': 'No autorizado'}), 403
    def to_float(v):
        return float(v) if v and str(v).strip() else None
    conexion = conectar_db()
    cursor   = conexion.cursor(dictionary=True)
    titulo        = request.form.get('titulo')
    descripcion   = request.form.get('descripcion')
    materiales    = request.form.get('materiales')
    medidas_largo = to_float(request.form.get('medidas_largo', ''))
    medidas_ancho = to_float(request.form.get('medidas_ancho', ''))
    medidas_alto  = to_float(request.form.get('medidas_alto', ''))
    cursor.execute("""
        UPDATE obras SET titulo=%s, descripcion=%s, materiales=%s,
        medidas_largo=%s, medidas_ancho=%s, medidas_alto=%s WHERE id=%s
    """, (titulo, descripcion, materiales, medidas_largo, medidas_ancho, medidas_alto, obra_id))
    if 'imagen_principal' in request.files:
        nueva = request.files['imagen_principal']
        if nueva and nueva.filename != '':
            cursor.execute("SELECT imagen_principal FROM obras WHERE id=%s", (obra_id,))
            anterior = cursor.fetchone()
            if anterior and anterior['imagen_principal']:
                ruta_ant = os.path.join(app.config['UPLOAD_FOLDER'], anterior['imagen_principal'])
                if os.path.exists(ruta_ant): os.remove(ruta_ant)
            filename = secure_filename(nueva.filename)
            nueva.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            cursor.execute("UPDATE obras SET imagen_principal=%s WHERE id=%s", (filename, obra_id))
    ids_eliminar = request.form.get('eliminar_secundarias')
    if ids_eliminar:
        for img_id in ids_eliminar.split(','):
            if img_id.strip():
                cursor.execute("SELECT imagen_url FROM imagenes_obras WHERE id=%s", (img_id,))
                img = cursor.fetchone()
                if img:
                    ruta = os.path.join(app.config['SECUNDARIAS_FOLDER'], img['imagen_url'])
                    if os.path.exists(ruta): os.remove(ruta)
                cursor.execute("DELETE FROM imagenes_obras WHERE id=%s", (img_id,))
    if 'nuevas_secundarias' in request.files:
        for img in request.files.getlist('nuevas_secundarias'):
            if img and img.filename != '':
                fn = secure_filename(img.filename)
                img.save(os.path.join(app.config['SECUNDARIAS_FOLDER'], fn))
                cursor.execute("INSERT INTO imagenes_obras (obra_id, imagen_url) VALUES (%s,%s)", (obra_id, fn))
    conexion.commit()
    cursor.close()
    conexion.close()
    return jsonify({'ok': True})

# Obtener un usuario por ID (solo admin)
@app.route('/api/usuario/<int:id>')
def api_obtener_usuario(id):
    if not (session.get('logged_in') and session.get('rol') == 1):
        return jsonify({'ok': False, 'error': 'No autorizado'}), 403
    conexion = conectar_db()
    cursor   = conexion.cursor(dictionary=True)
    cursor.execute("SELECT id, nombre, apellido, telefono, email, rol FROM usuarios WHERE id = %s", (id,))
    usuario = cursor.fetchone()
    cursor.close()
    conexion.close()
    if not usuario:
        return jsonify({'ok': False, 'error': 'Usuario no encontrado'}), 404
    return jsonify(usuario)

# Listar todos los usuarios (solo admin)
@app.route('/api/usuarios')
def api_usuarios():
    if not (session.get('logged_in') and session.get('rol') == 1):
        return jsonify({'ok': False, 'error': 'No autorizado'}), 403
    conexion = conectar_db()
    cursor   = conexion.cursor(dictionary=True)
    cursor.execute("SELECT id, nombre, apellido, telefono, email, rol FROM usuarios")
    usuarios = cursor.fetchall()
    cursor.close()
    conexion.close()
    return jsonify(usuarios)

# Actualizar usuario (solo admin)
@app.route('/api/actualizar_usuario/<int:id>', methods=['POST'])
def api_actualizar_usuario(id):
    if not (session.get('logged_in') and session.get('rol') == 1):
        return jsonify({'ok': False, 'error': 'No autorizado'}), 403
    data      = request.get_json()
    nombre    = data.get('nombre')
    apellido  = data.get('apellido')
    telefono  = data.get('telefono')
    email     = data.get('email')
    contrasena = data.get('contrasena')
    rol       = data.get('rol', 0)
    conexion  = conectar_db()
    cursor    = conexion.cursor()
    try:
        if contrasena:
            hashed = generate_password_hash(contrasena)
            cursor.execute("""
                UPDATE usuarios SET nombre=%s, apellido=%s, telefono=%s, email=%s, contrasena=%s, rol=%s
                WHERE id=%s
            """, (nombre, apellido, telefono, email, hashed, rol, id))
        else:
            cursor.execute("""
                UPDATE usuarios SET nombre=%s, apellido=%s, telefono=%s, email=%s, rol=%s
                WHERE id=%s
            """, (nombre, apellido, telefono, email, rol, id))
        conexion.commit()
        return jsonify({'ok': True})
    except Exception as e:
        conexion.rollback()
        return jsonify({'ok': False, 'error': str(e)}), 500
    finally:
        cursor.close()
        conexion.close()

# Eliminar usuario (solo admin)
@app.route('/api/eliminar_usuario/<int:id>', methods=['DELETE'])
def api_eliminar_usuario_json(id):
    if not (session.get('logged_in') and session.get('rol') == 1):
        return jsonify({'ok': False, 'error': 'No autorizado'}), 403
    try:
        conexion = conectar_db()
        cursor   = conexion.cursor()
        cursor.execute("DELETE FROM usuarios WHERE id = %s", (id,))
        conexion.commit()
        return jsonify({'ok': True})
    except Exception as e:
        conexion.rollback()
        return jsonify({'ok': False, 'error': str(e)}), 500
    finally:
        cursor.close()
        conexion.close()

# ----------------------------------------------------------------------
if __name__ == '__main__':
    app.run(debug=True)
