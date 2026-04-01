from flask import Flask, request, jsonify
from flask_cors import CORS
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import uuid 
import os
import json

app = Flask(__name__)
CORS(app) 

def connect_to_sheet():
    scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    
    google_creds_json = os.environ.get("GOOGLE_CREDENTIALS")
    
    if google_creds_json:
        creds_dict = json.loads(google_creds_json)
        creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
    else:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        json_path = os.path.join(base_dir, '..', 'credentials.json')
        
        if not os.path.exists(json_path):
             json_path = os.path.join(base_dir, 'credentials.json')

        creds = ServiceAccountCredentials.from_json_keyfile_name(json_path, scope)
    
    client = gspread.authorize(creds)
    sheet = client.open("Invitados_Boda_Wen").sheet1
    return sheet

@app.route('/confirmar', methods=['POST'])
def confirmar_asistencia():
    try:
        data = request.json
        sheet = connect_to_sheet()

        nombre = data.get('nombre')
        asistencia = data.get('asistencia')
        acompanantes = data.get('acompanantes', 0)
        cancion = data.get('cancion', '')
        id_invitado = str(uuid.uuid4())[:8] 

        nueva_fila = [nombre, asistencia, acompanantes, cancion, id_invitado]
        sheet.append_row(nueva_fila)

        return jsonify({
            "status": "success", 
            "message": "¡Confirmación guardada!",
            "id_qr": id_invitado 
        }), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)