import os
import json
import io
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

# Google Drive API scope
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

# Your Google Drive folder ID (we'll need to get this)
DRIVE_FOLDER_ID = 'YOUR_FOLDER_ID_HERE'  # Replace with actual folder ID

def authenticate_google_drive():
    """Authenticate with Google Drive API using stored credentials"""
    creds = None
    
    # Load credentials from environment variable (set in GitHub secrets)
    if 'GOOGLE_DRIVE_CREDENTIALS' in os.environ:
        creds_data = json.loads(os.environ['GOOGLE_DRIVE_CREDENTIALS'])
        creds = Credentials.from_authorized_user_info(creds_data, SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            raise Exception("No valid Google Drive credentials found")
    
    return build('drive', 'v3', credentials=creds)

def download_files_from_folder():
    """Download Excel files from Google Drive folder to public/data/"""
    service = authenticate_google_drive()
    
    # Create data directory if it doesn't exist
    os.makedirs('public/data', exist_ok=True)
    
    # Search for Excel files in the specified folder
    query = f"'{DRIVE_FOLDER_ID}' in parents and (name contains '.xlsx' or name contains '.xls')"
    results = service.files().list(q=query, fields="files(id, name, modifiedTime)").execute()
    files = results.get('files', [])
    
    print(f"Found {len(files)} Excel files in Google Drive folder")
    
    downloaded_count = 0
    for file in files:
        try:
            print(f"Downloading: {file['name']}")
            
            # Download file content
            request = service.files().get_media(fileId=file['id'])
            file_content = io.BytesIO()
            downloader = MediaIoBaseDownload(file_content, request)
            
            done = False
            while done is False:
                status, done = downloader.next_chunk()
            
            # Save to public/data/ directory
            file_path = os.path.join('public/data', file['name'])
            with open(file_path, 'wb') as f:
                f.write(file_content.getvalue())
            
            print(f"  ✓ Saved to: {file_path}")
            downloaded_count += 1
            
        except Exception as e:
            print(f"  ✗ Error downloading {file['name']}: {str(e)}")
    
    print(f"\nDownload complete: {downloaded_count}/{len(files)} files downloaded")
    return downloaded_count > 0

if __name__ == '__main__':
    try:
        if download_files_from_folder():
            print("Files updated successfully")
            exit(0)
        else:
            print("No files were downloaded")
            exit(1)
    except Exception as e:
        print(f"Error: {str(e)}")
        exit(1)
