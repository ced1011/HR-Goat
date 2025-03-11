# RCE Vulnerability Testing

This directory contains example JSON files that demonstrate the Remote Code Execution (RCE) vulnerability via insecure deserialization in the HRGoat application.

## Test Files

- `rce_test.json`: Simple test that writes to a file in the server's working directory
- `rce_test_windows.json`: Windows-specific test that writes to C:/temp/
- `rce_command_test.json`: Executes a command and captures the output to a file
- `rce_exploit.json`: Contains a Bash reverse shell payload for Linux/macOS systems
- `rce_exploit_windows.json`: Contains a PowerShell reverse shell payload for Windows systems

## How to Test the Vulnerability

1. Start the HRGoat application server:
   ```
   cd server
   node server.js
   ```

2. Navigate to the Employees section in the web application

3. Click on "Bulk Upload" to access the bulk employee upload feature

4. Choose one of the following methods:
   - Click "Choose File" and select one of the JSON files from this directory
   - Copy the contents of one of the JSON files and paste it into the text area

5. Click "Upload Employees"

6. Check the server console for detailed logs about the deserialization process

7. Verify the exploit worked by looking for:
   - `rce_test.txt` or `command_output.txt` in the server's working directory
   - For Windows tests, check `C:/temp/rce_test.txt`

## Troubleshooting

If the exploit doesn't work, check the following:

1. **Server Logs**: Look for error messages in the server console
   
2. **JSON Format**: Ensure the JSON is properly formatted
   
3. **Metadata Format**: The `metadata` field must be a string containing serialized data with the correct format for `node-serialize`
   
4. **File Permissions**: Ensure the server has permission to write to the target directory
   
5. **Command Execution**: Try a simpler command if `dir` or other commands aren't working

## Common Issues

1. **Escaping**: The JSON string must be properly escaped. Double quotes inside the metadata string must be escaped with backslashes.

2. **Serialization Format**: The `_$$ND_FUNC$$_` prefix is required for the function to be executed.

3. **Error Handling**: The server catches deserialization errors and continues processing, which means if there's an issue with the payload, it might silently fail.

## Security Note

This vulnerability is intentionally included for educational purposes. In a real application, never use `node-serialize` or similar libraries that allow code execution during deserialization. Always validate and sanitize user input, and use safer alternatives like `JSON.parse()` for data deserialization.

## Security Warning

These examples are provided for educational purposes only. The exploits demonstrate a serious security vulnerability that should never be present in production applications. Use these examples only in controlled environments where the vulnerability has been intentionally implemented for learning purposes.

## Mitigation

In real-world applications, you should:

1. Never deserialize untrusted data
2. Use safer alternatives like JSON.parse() instead of serialization libraries that support code execution
3. Validate and sanitize all user inputs
4. Implement integrity checks for serialized data
5. Run applications with the minimum necessary permissions 