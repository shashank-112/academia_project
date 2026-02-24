# 🎓 Password Hashing Demo Scripts

These are **standalone educational demos** (NOT related to your Django project) to understand how password hashing works.

---

## 📋 Available Demo Scripts

### **1. `demo_simple_hash.py` - Standalone Hash Generator**
Convert plain text to hash (NO DJANGO NEEDED)

```bash
python demo_simple_hash.py
```

**What it does:**
- Takes plain text password as input
- Shows SHA256 hash (simple version)
- Shows PBKDF2 hash (secure version like Django uses)
- Interactive: Enter multiple passwords to see their hashes

**Key Learning:**
- Same password = Different hashes (due to salt)
- Hashes are irreversible

---

### **2. `demo_simple_verification.py` - Hash Verification (NO DJANGO NEEDED)**
Verify passwords against hashes

```bash
python demo_simple_verification.py
```

**What it does:**
- Create a password and hash it
- Try different passwords to verify them
- See which ones match and which don't
- Understand why hashes can't be reversed

**Key Learning:**
- How login systems verify passwords
- Why hashing is secure
- What "correct password" means

---

### **3. `demo_plain_to_hash.py` - Django-based Hash Generator**
Uses your actual Django project setup

```bash
python demo_plain_to_hash.py
```

**What it does:**
- Input: Plain text password
- Output: PBKDF2-SHA256 hash (same as your project)
- Shows exact format used in your database
- Each hash is different (salt randomization)

---

### **4. `demo_hash_verification.py` - Django-based Verification**
Uses your actual Django password verification

```bash
python demo_hash_verification.py
```

**What it does:**
- Create a password
- Test it against the hash
- Explains why hashes can't be converted back
- Shows practical password verification

---

## 🚀 Quick Start

### **To See it in Action:**

**Terminal 1** - Plain text to hash:
```bash
cd "d:\31 project\project"
python demo_simple_hash.py
```

**Terminal 2** - Verify passwords:
```bash
cd "d:\31 project\project"
python demo_simple_verification.py
```

---

## 💡 What You'll Learn

### Plain Text Hash Comparison

**Before (Plain Text - INSECURE):**
```
Password: 1234
Stored:   1234
Problem:  Anyone with database access can see the password!
```

**After (Hashed - SECURE):**
```
Password: 1234
Stored:   pbkdf2_sha256$600000$x25R4oUIrwVYtO0M7G4kkX$Q1iK90suPlqT7vo8...
Benefit:  Even if hacker gets hash, they can't get the password!
```

---

## ❓ FAQ

### **Q: Can I reverse the hash to get the password?**
**A:** No! That's the whole point of hashing. It's one-way encryption.

### **Q: Why do I get different hashes each time?**
**A:** Because of **salt** - a random value added to each password before hashing. This prevents rainbow table attacks.

### **Q: How does login work then?**
**A:** 
1. User enters password → "1234"
2. System hashes it → pbkdf2_sha256$600000$...
3. Compares with stored hash
4. If they match → Login success!

### **Q: What if someone steals my database?**
**A:** They get hashes, not passwords. Takes millions of years to brute force.

### **Q: Which algorithm is best?**
**A:** From best to worst:
1. **Argon2** (Best) - Slowest, most secure
2. **bcrypt** (Great) - Slow, very secure
3. **PBKDF2** (Good) - Medium speed, secure
4. **MD5/SHA1** (Broken) - Too fast, weak

Your project uses **PBKDF2-SHA256** with 600,000 iterations ✅

---

## 📊 Example Output

```
💡 How it works:
   - Input: Plain text password
   - Output: Hashed/encrypted cipher text
   - This is ONE-WAY encryption (cannot be reversed)

📝 Enter plain text password: MyPassword123

✅ CONVERSION SUCCESSFUL!

📥 INPUT (Plain Text):
   MyPassword123

📤 OUTPUT (Cipher Text/Hash):
   pbkdf2_sha256$600000$QFztODHRkAm3x14K$5h4FjZeK8HjW2kL9pM3nO...

🔍 Hash Details:
   Algorithm: PBKDF2-SHA256
   Iterations: 600,000
   Salt: Random (different every time)
```

---

## 🔐 Security Principle

```
HASHING = One-Way Function = Secure
┌─────────────────┐     ┌──────────────────────┐
│ Plain Password  │  →  │ Hashed Password      │
│  (Human Readable) │  │ (Encrypted Cipher)   │
└─────────────────┘     └──────────────────────┘
```

vs

```
ENCRYPTION = Two-Way Function = Less Secure Alone
┌─────────────────┐     ┌──────────────────────┐
│ Plain Password  │ ←→  │ Encrypted Password   │
│ (Can Decrypt!)  │     │ (If key leaked!)     │
└─────────────────┘     └──────────────────────┘
```

---

## 🎯 Educational Goals

- ✅ Understand password hashing
- ✅ See why plain text is dangerous
- ✅ Learn how verification works
- ✅ Appreciate salt and iterations
- ✅ Know difference between hashing and encryption

---

## 📝 Run Order (Recommended)

1. Run `demo_simple_hash.py` - See hashing in action
2. Run `demo_simple_verification.py` - Understand verification
3. Run `demo_plain_to_hash.py` - See your project's hashing
4. Run `demo_hash_verification.py` - See your project's verification

---

**Enjoy learning about password security!** 🔐
