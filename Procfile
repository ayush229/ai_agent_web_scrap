web: gunicorn backend.main:app --timeout 600 --workers 4 --worker-class gevent
frontend: cd frontend && npm install -g serve && npm run build && serve -s build -l 5001
release: cd frontend && npm install && npm run build