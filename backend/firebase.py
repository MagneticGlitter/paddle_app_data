import firebase_admin
from firebase_admin import credentials, storage
from google.api_core.exceptions import NotFound

cred = credentials.Certificate('firebase_credentials.json')
print("=============================")
print("Cred: ", cred)
print("=============================")
app = firebase_admin.initialize_app(cred, {
    'storageBucket': 'paddleapp-825ca.appspot.com',
    'projectId': 'paddleapp-825ca'
})

def get_file():
    
    try:
        bucket = storage.bucket(app = app)
        files = list(bucket.list_blobs())  # Convert the iterator to a list
        if not files:
            print("No files found in the bucket.")
            return None
        
        sorted_files = sorted(files, key=lambda file: file.time_created, reverse=True)
        latest_file = sorted_files[0]
        return latest_file
    except NotFound as e:
        print("Bucket not found or no access to bucket.")
        print(e)
        return None
    except Exception as e:
        print("An error occurred while fetching the file.")
        print(e)
        return None


