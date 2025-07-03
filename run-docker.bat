@echo off
docker rm -f hrportaltest
docker run -d -p 80:80 -p 5001:5001 -e DB_HOST=hrgoat-db.cnye4gmgu5x2.us-west-1.rds.amazonaws.com -e DB_USER=user -e DB_PASSWORD=password -e DB_NAME=hrportal --name hrportaltest hrgoat-app
echo Container started. Check logs with: docker logs hrportaltest 