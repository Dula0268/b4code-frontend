#!/bin/bash
find src/app/owner -name "page.tsx" -exec grep -q 'navItems =' {} \; -print > files_with_nav.txt

cat files_with_nav.txt | while read file; do
    # Check if CreditCard is already imported
    if ! grep -q "CreditCard" "$file"; then
        # Add CreditCard to lucide-react imports
        sed -i '' 's/Settings,/Settings, CreditCard, Landmark,/' "$file"
    fi
    
    # Check if Billing & Payout is already in navItems
    if ! grep -q 'label: "Billing & Payouts"' "$file"; then
        # Use awk to insert the new nav item before the Settings item
        awk '
            /label: "Settings"/ {
                print "        { label: \"Billing & Payouts\", icon: <Landmark size={18} />, href: \"/owner/setting/billing&Payout\" },"
            }
            {print}
        ' "$file" > tmp_file && mv tmp_file "$file"
    fi
done
echo "Processed all files"
