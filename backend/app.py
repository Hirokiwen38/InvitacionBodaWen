from flask import Flask, request, jsonify
from flask_cors import CORS
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import uuid # Para generar un ID único por invitado (para el QR)

app = Flask(__name__)
CORS(app) # Esto permite que tu HTML (frontend) se comunique con Python (backend)

# 1. Configurar la conexión con Google Sheets
def connect_to_sheet():
    scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    # Asegúrate de que el archivo se llame exactamente así y esté en la carpeta backend/
    creds = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', scope)
    client = gspread.authorize(creds)
    # Abre el documento por su nombre 
    sheet = client.open("Invitados_Boda_Wen").sheet1
    return sheet

@app.route('/confirmar', methods=['POST'])
def confirmar_asistencia():
    try:
        data = request.json
        sheet = connect_to_sheet()

        # Extraer datos del JSON enviado por el Frontend
        nombre = data.get('nombre')
        asistencia = data.get('asistencia')
        acompanantes = data.get('acompanantes', 0)
        cancion = data.get('cancion', '')
        # Generamos un ID único corto para el código QR
        id_invitado = str(uuid.uuid4())[:8] 

        # 2. Insertar fila en Google Sheets
        # El orden debe coincidir con tus columnas: Nombre, Asistencia, Acompañantes, Cancion, ID_Invitado
        nueva_fila = [nombre, asistencia, acompanantes, cancion, id_invitado]
        sheet.append_row(nueva_fila)

        return jsonify({
            "status": "success", 
            "message": "¡Confirmación guardada!",
            "id_qr": id_invitado # Enviamos el ID de vuelta para generar el QR en el cel del invitado
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)