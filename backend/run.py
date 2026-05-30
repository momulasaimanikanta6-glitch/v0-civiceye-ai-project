from app import create_app

app = create_app()

if __name__ == '__main__':
    # Default port for local dev; docker-compose maps 5000
    # Use a non-privileged port by default to avoid conflicts on local machines
    app.run(host='0.0.0.0', port=5050, debug=True)



