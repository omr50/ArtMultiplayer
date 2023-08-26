FROM tensorflow/tensorflow:latest

WORKDIR /app

# requirements first so dependencies not
# re-installed if they're cached.
COPY requirements.txt requirements.txt
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY . .

ENV FLASK_ENV=production

EXPOSE 5000

# Run the app when the container launches
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
