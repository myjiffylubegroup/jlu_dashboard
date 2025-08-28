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
DRIVE_FOLDER_ID = '1zsijSWM7vOVlqjV0F0BztnH3BbX6oHio'  # JLU Raw folder
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
    """Download Excel files from Google Drive folder to public/data/, keeping only latest versions"""
    service = authenticate_google_drive()
    
    # Create data directory if it doesn't exist
    os.makedirs('public/data', exist_ok=True)
    
    # Clean out old files first to prevent accumulation
    print("Cleaning old data files...")
    for filename in os.listdir('public/data'):
        if filename.endswith(('.xlsx', '.xls')):
            os.remove(os.path.join('public/data', filename))
            print(f"  Removed old file: {filename}")
    
    # Search for Excel files in the specified folder
    query = f"'{DRIVE_FOLDER_ID}' in parents and (name contains '.xlsx' or name contains '.xls')"
    results = service.files().list(q=query, fields="files(id, name, modifiedTime)", orderBy='modifiedTime desc').execute()
    files = results.get('files', [])
    
    print(f"Found {len(files)} Excel files in Google Drive folder")
    
    # Group files by type to get only the most recent of each
    file_types = {}
    for file in files:
        if 'CertPercent' in file['name'] or 'Franchise' in file['name']:
            file_type = 'franchise'
        elif 'MDCReport' in file['name']:
            # Extract store number from filename
            import re
            store_match = re.search(r'(\d{3,4})', file['name'])
            if store_match:
                file_type = f"store_{store_match.group(1)}"
            else:
                file_type = 'unknown_store'
        else:
            file_type = 'other'
        
        # Keep only the most recent file of each type
        if file_type not in file_types:
            file_types[file_type] = file
    
    print(f"Filtered to {len(file_types)} unique file types")
    
    downloaded_count = 0
    for file_type, file in file_types.items():
        try:
            # Create a clean filename
            if file_type == 'franchise':
                clean_name = f"FranchiseDashboard_{file['modifiedTime'][:10]}.xlsx"
            elif file_type.startswith('store_'):
                store_num = file_type.replace('store_', '')
                clean_name = f"MDCReport_Store{store_num}_{file['modifiedTime'][:10]}.xlsx"
            else:
                clean_name = file['name']
            
            print(f"Downloading: {file['name']} -> {clean_name}")
            
            # Download file content
            request = service.files().get_media(fileId=file['id'])
            file_content = io.BytesIO()
            downloader = MediaIoBaseDownload(file_content, request)
            
            done = False
            while done is False:
                status, done = downloader.next_chunk()
            
            # Save with clean filename
            file_path = os.path.join('public/data', clean_name)
            with open(file_path, 'wb') as f:
                f.write(file_content.getvalue())
            
            print(f"  ✓ Saved to: {file_path}")
            downloaded_count += 1
            
        except Exception as e:
            print(f"  ✗ Error downloading {file['name']}: {str(e)}")
    
    print(f"\nDownload complete: {downloaded_count} files downloaded")
    print("Expected files: 1 franchise dashboard + 8 store MDC reports = 9 total")
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
