interface BookingData {
  customer_name: string;
  phone: string;
  email?: string | null;
  service_slug: string;
  preferred_date: string;
  time_slot: string;
  state?: string | null;
  district?: string | null;
  pincode?: string | null;
  address?: string | null;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vartikacleaningsolutions.in/";
const LOGO_URL = `${SITE_URL}/newlogogreen.svg`;

function wrapLayout(body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Vartika Cleaning Solutions</title>
</head>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:Inter,system-ui,-apple-system,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8">
    <tr>
      <td align="center" style="padding:32px 16px">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding:0 0 24px">
              <img src="${LOGO_URL}" alt="Vartika Cleaning Solutions" width="160" height="auto" style="display:block;border:0;max-width:160px">
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background:#FFFFFF;border-radius:12px;padding:40px 36px;box-shadow:0 2px 12px rgba(24,24,22,0.07)">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 0 0;font-size:12px;color:#B0AFA8;line-height:1.6">
              <p style="margin:0 0 4px">&copy; ${new Date().getFullYear()} Vartika Cleaning Solutions</p>
              <p style="margin:0">Delhi NCR &bull; <a href="${SITE_URL}" style="color:#3D5948;text-decoration:underline">vartikacleaning.com</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function customerBookingEmail(data: BookingData) {
  const { customer_name, service_slug, preferred_date, time_slot } = data;
  const dateStr = new Date(preferred_date).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
  const timeLabel: Record<string, string> = {
    morning: "8:00 AM – 12:00 PM",
    afternoon: "12:00 PM – 4:00 PM",
    evening: "4:00 PM – 8:00 PM",
  };
  const timeStr = timeLabel[time_slot] || time_slot;

  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <!-- Checkmark icon -->
      <tr>
        <td align="center" style="padding:0 0 8px">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:56px;height:56px;border-radius:50%;background:#3D5948">
            <tr>
              <td align="center" valign="middle" style="font-size:26px;color:#FFFFFF;line-height:56px">&#10003;</td>
            </tr>
          </table>
        </td>
      </tr>
      <!-- Title -->
      <tr>
        <td align="center" style="padding:0 0 24px">
          <h1 style="margin:0;font-size:22px;font-weight:600;color:#181816;letter-spacing:-0.3px">Booking Received!</h1>
        </td>
      </tr>
      <!-- Greeting -->
      <tr>
        <td style="padding:0 0 20px;font-size:15px;color:#3C3C38;line-height:1.6">
          Thank you, <strong style="color:#181816">${customer_name}</strong>. Your booking has been received successfully.
        </td>
      </tr>
      <!-- Details card -->
      <tr>
        <td style="padding:0 0 24px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F1EB;border-radius:10px;overflow:hidden">
            <tr>
              <td style="padding:4px 20px;border-bottom:1px solid rgba(24,24,22,0.06)">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:14px 0;font-size:13px;color:#808078">Service</td>
                    <td style="padding:14px 0;font-size:14px;font-weight:600;color:#181816;text-align:right;text-transform:capitalize">${service_slug.replace(/-/g, " ")}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 20px;border-bottom:1px solid rgba(24,24,22,0.06)">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:14px 0;font-size:13px;color:#808078">Date</td>
                    <td style="padding:14px 0;font-size:14px;font-weight:600;color:#181816;text-align:right">${dateStr}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 20px">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:14px 0;font-size:13px;color:#808078">Time</td>
                    <td style="padding:14px 0;font-size:14px;font-weight:600;color:#181816;text-align:right">${timeStr}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <!-- Message -->
      <tr>
        <td style="padding:0 0 28px;font-size:14px;color:#3C3C38;line-height:1.6">
          Our team will contact you within <strong>2 hours</strong> to confirm your appointment. For urgent inquiries, reach us on WhatsApp.
        </td>
      </tr>
      <!-- CTA -->
      <tr>
        <td align="center" style="padding:0 0 4px">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="border-radius:999px;background:#25D366">
                <a href="https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210"}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;white-space:nowrap">
                  &#128172; Contact on WhatsApp
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  return wrapLayout(body);
}

export function adminNotificationEmail(data: BookingData) {
  const { customer_name, phone, service_slug, preferred_date, time_slot, address, district, state, pincode } = data;
  const dateStr = new Date(preferred_date).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
  const timeLabel: Record<string, string> = {
    morning: "8:00 AM – 12:00 PM",
    afternoon: "12:00 PM – 4:00 PM",
    evening: "4:00 PM – 8:00 PM",
  };
  const timeStr = timeLabel[time_slot] || time_slot;
  const addressParts = [address, district, state, pincode].filter(Boolean);
  const addressLine = addressParts.length ? addressParts.join(", ") : null;

  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <!-- Alert badge -->
      <tr>
        <td align="center" style="padding:0 0 8px">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:56px;height:56px;border-radius:50%;background:#3D5948">
            <tr>
              <td align="center" valign="middle" style="font-size:26px;color:#FFFFFF;line-height:56px">&#128276;</td>
            </tr>
          </table>
        </td>
      </tr>
      <!-- Title -->
      <tr>
        <td align="center" style="padding:0 0 24px">
          <h1 style="margin:0;font-size:22px;font-weight:600;color:#181816;letter-spacing:-0.3px">New Booking</h1>
        </td>
      </tr>
      <!-- Details card -->
      <tr>
        <td style="padding:0 0 24px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F1EB;border-radius:10px;overflow:hidden">
            <tr>
              <td style="padding:4px 20px;border-bottom:1px solid rgba(24,24,22,0.06)">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:12px 0;font-size:13px;color:#808078">Customer</td>
                    <td style="padding:12px 0;font-size:14px;font-weight:600;color:#181816;text-align:right">${customer_name}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 20px;border-bottom:1px solid rgba(24,24,22,0.06)">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:12px 0;font-size:13px;color:#808078">Phone</td>
                    <td style="padding:12px 0;font-size:14px;font-weight:600;color:#181816;text-align:right">
                      <a href="tel:${phone}" style="color:#3D5948;text-decoration:none">${phone}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 20px;border-bottom:1px solid rgba(24,24,22,0.06)">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:12px 0;font-size:13px;color:#808078">Service</td>
                    <td style="padding:12px 0;font-size:14px;font-weight:600;color:#181816;text-align:right;text-transform:capitalize">${service_slug.replace(/-/g, " ")}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 20px;border-bottom:1px solid rgba(24,24,22,0.06)">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:12px 0;font-size:13px;color:#808078">Date &amp; Time</td>
                    <td style="padding:12px 0;font-size:14px;font-weight:600;color:#181816;text-align:right">${dateStr}, ${timeStr}</td>
                  </tr>
                </table>
              </td>
            </tr>
            ${addressLine ? `
            <tr>
              <td style="padding:4px 20px">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:12px 0;font-size:13px;color:#808078;vertical-align:top">Address</td>
                    <td style="padding:12px 0;font-size:14px;font-weight:500;color:#181816;text-align:right;max-width:280px">${addressLine}</td>
                  </tr>
                </table>
              </td>
            </tr>
            ` : ""}
          </table>
        </td>
      </tr>
      <!-- CTA: View in Admin -->
      <tr>
        <td align="center" style="padding:0 0 12px">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="border-radius:999px;background:#3D5948">
                <a href="${SITE_URL}/admin/bookings" target="_blank" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;white-space:nowrap">
                  View in Admin Dashboard
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <!-- CTA: WhatsApp -->
      <tr>
        <td align="center" style="padding:0">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="border-radius:999px;border:1.5px solid #25D366">
                <a href="https://wa.me/${phone}" target="_blank" style="display:inline-block;padding:12px 28px;font-size:13px;font-weight:600;color:#25D366;text-decoration:none;white-space:nowrap">
                  &#128172; WhatsApp Customer
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  return wrapLayout(body);
}
