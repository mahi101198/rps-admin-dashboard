# Extract environment variables from .env.local and set them as Vercel secrets

# Read the .env.local file
$envContent = Get-Content .env.local

# Extract each variable
$apiKey = ($envContent | Select-String "NEXT_PUBLIC_FIREBASE_API_KEY" | ForEach-Object { ($_ -split '=', 2)[1] }).Trim()
$authDomain = ($envContent | Select-String "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" | ForEach-Object { ($_ -split '=', 2)[1] }).Trim()
$databaseUrl = ($envContent | Select-String "NEXT_PUBLIC_FIREBASE_DATABASE_URL" | ForEach-Object { ($_ -split '=', 2)[1] }).Trim()
$projectId = ($envContent | Select-String "NEXT_PUBLIC_FIREBASE_PROJECT_ID" | ForEach-Object { ($_ -split '=', 2)[1] }).Trim()
$storageBucket = ($envContent | Select-String "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" | ForEach-Object { ($_ -split '=', 2)[1] }).Trim()
$messagingSenderId = ($envContent | Select-String "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" | ForEach-Object { ($_ -split '=', 2)[1] }).Trim()
$appId = ($envContent | Select-String "NEXT_PUBLIC_FIREBASE_APP_ID" | ForEach-Object { ($_ -split '=', 2)[1] }).Trim()
$clientEmail = ($envContent | Select-String "FIREBASE_CLIENT_EMAIL" | ForEach-Object { ($_ -split '=', 2)[1] }).Trim()
$privateKey = ($envContent | Select-String "FIREBASE_PRIVATE_KEY" | ForEach-Object { ($_ -split '=', 2)[1] }).Trim()

# Remove quotes from the private key if present
$privateKey = $privateKey -replace '^"(.*)"$', '$1'

# Set Vercel secrets using echo and pipe
echo "Setting Vercel secrets..."

# Create temporary files for each secret
echo $apiKey > temp_apikey.txt
echo $authDomain > temp_authdomain.txt
echo $databaseUrl > temp_databaseurl.txt
echo $projectId > temp_projectid.txt
echo $storageBucket > temp_storagebucket.txt
echo $messagingSenderId > temp_messagingsenderid.txt
echo $appId > temp_appid.txt
echo $clientEmail > temp_clientemail.txt
echo $privateKey > temp_privatekey.txt

# Add secrets using the temp files
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production < temp_apikey.txt
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production < temp_authdomain.txt
vercel env add NEXT_PUBLIC_FIREBASE_DATABASE_URL production < temp_databaseurl.txt
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production < temp_projectid.txt
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production < temp_storagebucket.txt
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production < temp_messagingsenderid.txt
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production < temp_appid.txt
vercel env add FIREBASE_CLIENT_EMAIL production < temp_clientemail.txt
vercel env add FIREBASE_PRIVATE_KEY production < temp_privatekey.txt

# Clean up temporary files
Remove-Item temp_apikey.txt
Remove-Item temp_authdomain.txt
Remove-Item temp_databaseurl.txt
Remove-Item temp_projectid.txt
Remove-Item temp_storagebucket.txt
Remove-Item temp_messagingsenderid.txt
Remove-Item temp_appid.txt
Remove-Item temp_clientemail.txt
Remove-Item temp_privatekey.txt

echo "Vercel secrets have been set."