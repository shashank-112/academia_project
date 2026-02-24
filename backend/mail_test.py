import smtplib

sender = "yuvashashank.uriti@gmail.com"
password = "spqggkjjzqremgql"
receiver = "yuvashashank56@gmail.com"

subject = "SMTP Test"
body = "This is a test email from Python SMTP."

message = f"Subject: {subject}\n\n{body}"

try:
    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(sender, password)
        server.sendmail(sender, receiver, message)

    print("Email sent successfully!")

except Exception as e:
    print("Error:", e)