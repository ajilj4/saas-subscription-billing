package in.ajildev.saas_subscription_billing.security;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

public class PaynproUtil {

    public static String generateSignature(String keySecret, String... params) {
        try {
            Mac hmacSHA256 = Mac.getInstance("HmacSHA256");
            hmacSHA256.init(new SecretKeySpec(keySecret.getBytes(), "HmacSHA256"));
            StringBuilder sb = new StringBuilder();
            for (String p : params)
                sb.append(p);
            byte[] hash = hmacSHA256.doFinal(sb.toString().getBytes());
            StringBuilder hex = new StringBuilder();
            for (byte b : hash)
                hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error generating signature", e);
        }
    }

    public static String generateMD5Signature(String secretKey, java.util.Map<String, Object> params) {
        try {
            // 1. Sort keys alphabetically
            java.util.List<String> sortedKeys = new java.util.ArrayList<>(params.keySet());
            java.util.Collections.sort(sortedKeys);

            // 2. Concatenate values
            StringBuilder sb = new StringBuilder();
            for (String key : sortedKeys) {
                if (params.get(key) != null && !key.equals("sign")) {
                    sb.append(params.get(key).toString());
                }
            }

            // 3. Add secret key as salt
            sb.append(secretKey);

            // 4. MD5 encryption
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
            byte[] hash = md.digest(sb.toString().getBytes());

            // 5. Convert to hex (lowercase)
            StringBuilder hex = new StringBuilder();
            for (byte b : hash)
                hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error generating MD5 signature", e);
        }
    }

    public static String encryptAES(String plainText, String encryptionKey, String salt) {
        try {
            byte[] iv = salt.getBytes();
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            SecretKeySpec keySpec = new SecretKeySpec(encryptionKey.getBytes(), "AES");
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, new IvParameterSpec(iv));
            byte[] encrypted = cipher.doFinal(plainText.getBytes());
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting AES", e);
        }
    }
}
