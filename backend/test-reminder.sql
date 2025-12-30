UPDATE trips
SET departure_time = NOW() + INTERVAL '3 hours',
    arrival_time   = NOW() + INTERVAL '6 hours'
WHERE id = '41641a83-4ffc-48f5-9c79-c9a1abd4cd09';

UPDATE trips
SET departure_time = NOW() + INTERVAL '24 hours',
    arrival_time   = NOW() + INTERVAL '27 hours'
WHERE id = '41641a83-4ffc-48f5-9c79-c9a1abd4cd09';


UPDATE bookings
SET booked_at = NOW() - INTERVAL '12 hours 1 minute'
WHERE id = '904072bf-f3df-4f01-854d-ac9345ca04fd';

