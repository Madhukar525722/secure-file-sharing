FROM python:3.9-slim
RUN pip3 install django djangorestframework djangorestframework-simplejwt pyotp
RUN npm install redux react-redux redux-thunk axios web-vitals