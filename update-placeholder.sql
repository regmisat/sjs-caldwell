-- Update all speakers with placeholder.jpg to have null photo_url
UPDATE speakers 
SET photo_url = NULL 
WHERE photo_url = '/speakers/placeholder.jpg';
