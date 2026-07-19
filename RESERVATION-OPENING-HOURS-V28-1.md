# TRAP Room Reservation Opening Hours V28.1

The Reservation page now reads opening-hour data from the same Shop document
used by Admin Store Settings.

Priority:

1. `shop.openingHoursSchedule`
2. `shop.openingHours`
3. a safe updating message

The structured schedule displays separate weekday and weekend rows. The
legacy summary remains supported, so existing data is not lost.

No additional API request is added. The page continues to use the public store
from `useOutletContext()`, keeping it synchronized with the rest of the client.
