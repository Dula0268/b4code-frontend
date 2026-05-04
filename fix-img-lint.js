const fs = require('fs');
const files = [
    "src/app/owner/rate/discount/page.tsx",
    "src/app/owner/rate/editRate/page.tsx",
    "src/app/owner/rate/page.tsx",
    "src/app/owner/(room & inventry)/roomManagement/addRoom/page.tsx",
    "src/app/owner/(room & inventry)/roomManagement/page.tsx",
    "src/app/owner/(Entry & overview)/ownerDashboard/page.tsx",
    "src/app/owner/reservation/reservationDetails/manualBooking/page.tsx",
    "src/app/owner/reservation/reservationDetails/page.tsx",
    "src/app/owner/reservation/page.tsx",
    "src/app/owner/availability/bookingDetails/page.tsx",
    "src/app/owner/(Property)/properties/editPropertyDetails/page.tsx",
    "src/app/owner/(Property)/properties/Rate/page.tsx",
    "src/app/owner/(Property)/properties/propertyRoomInventry/page.tsx",
    "src/app/owner/(Property)/properties/Reservation/page.tsx",
    "src/app/owner/(Property)/properties/propertyDetails/page.tsx",
    "src/app/owner/(Property)/properties/Availability/page.tsx",
    "src/app/owner/(Property)/properties/Staff/viewProfile/page.tsx",
    "src/app/owner/(Property)/properties/Staff/addStaff/page.tsx",
    "src/app/owner/(Property)/properties/Staff/page.tsx",
    "src/app/owner/(Property)/properties/createNewProperty/page.tsx",
    "src/app/owner/(Property)/properties/Setting/page.tsx",
    "src/app/owner/(Property)/properties/page.tsx",
    "src/app/owner/(Property)/properties/Media/page.tsx",
    "src/app/owner/setting/accountSetting/changePassword/page.tsx",
    "src/app/owner/setting/accountSetting/Billing&Payout/page.tsx",
    "src/app/owner/setting/accountSetting/addNewBankAccount/page.tsx",
    "src/app/owner/setting/accountSetting/changePhoto/page.tsx",
    "src/app/owner/setting/accountSetting/page.tsx",
    "src/app/owner/setting/propertySetting/reservationRestriction/createRestriction/page.tsx",
    "src/app/owner/setting/propertySetting/reservationRestriction/page.tsx",
    "src/app/owner/setting/propertySetting/reservationRestriction/editRestriction/page.tsx",
    "src/app/owner/setting/propertySetting/page.tsx",
    "src/app/owner/setting/propertySetting/inventry&Overbooking/page.tsx",
    "src/app/owner/setting/integration/page.tsx",
    "src/app/owner/setting/notificationPreferences/page.tsx",
    "src/app/owner/setting/billing&Payout/page.tsx"
];

const comment = "/* eslint-disable @next/next/no-img-element */\n";

for (const file of files) {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        if (!content.includes('eslint-disable @next/next/no-img-element')) {
            fs.writeFileSync(file, comment + content);
        }
    }
}
console.log("Done");
