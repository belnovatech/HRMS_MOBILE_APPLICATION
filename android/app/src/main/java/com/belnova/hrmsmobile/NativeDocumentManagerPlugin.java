package com.belnova.hrmsmobile;

import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Environment;
import android.util.Base64;
import android.util.Log;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;

@CapacitorPlugin(name = "NativeDocumentManager")
public class NativeDocumentManagerPlugin extends Plugin {
    private static final String TAG = "NativeDocumentManager";

    /**
     * Saves a base64 encoded document to local storage safely.
     * Generates duplicate-safe filenames and returns local file path & FileProvider URI.
     */
    @PluginMethod
    public void saveDocument(PluginCall call) {
        String fileName = call.getString("fileName");
        String base64Data = call.getString("base64Data");
        String mimeType = call.getString("mimeType", "application/octet-stream");

        if (fileName == null || fileName.isEmpty()) {
            call.reject("Parameter 'fileName' is required.");
            return;
        }

        if (base64Data == null || base64Data.isEmpty()) {
            call.reject("Parameter 'base64Data' is required.");
            return;
        }

        try {
            // Strip data URL prefix if present (e.g. data:application/pdf;base64,...)
            if (base64Data.contains(",")) {
                base64Data = base64Data.substring(base64Data.indexOf(",") + 1);
            }

            byte[] decodedBytes = Base64.decode(base64Data, Base64.DEFAULT);

            Context context = getContext();
            File downloadDir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
            if (downloadDir == null) {
                downloadDir = context.getFilesDir();
            }

            if (!downloadDir.exists()) {
                downloadDir.mkdirs();
            }

            // Generate duplicate-safe filename
            String cleanFileName = sanitizeFileName(fileName);
            File targetFile = getUniqueFile(downloadDir, cleanFileName);

            FileOutputStream fos = new FileOutputStream(targetFile);
            fos.write(decodedBytes);
            fos.flush();
            fos.close();

            // Generate content URI through FileProvider
            String authority = context.getPackageName() + ".fileprovider";
            Uri contentUri = FileProvider.getUriForFile(context, authority, targetFile);

            JSObject result = new JSObject();
            result.put("success", true);
            result.put("fileName", targetFile.getName());
            result.put("filePath", targetFile.getAbsolutePath());
            result.put("uri", contentUri.toString());
            result.put("mimeType", mimeType);
            result.put("size", targetFile.length());

            Log.d(TAG, "File successfully saved to: " + targetFile.getAbsolutePath());
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error saving document: ", e);
            call.reject("Failed to save file: " + e.getMessage(), e);
        }
    }

    /**
     * Opens a saved document using the native Android intent and system viewer.
     */
    @PluginMethod
    public void openDocument(PluginCall call) {
        String filePath = call.getString("filePath");
        String fileName = call.getString("fileName");
        String mimeType = call.getString("mimeType", "application/octet-stream");

        try {
            Context context = getContext();
            File file = null;

            if (filePath != null && !filePath.isEmpty()) {
                file = new File(filePath);
            } else if (fileName != null && !fileName.isEmpty()) {
                File downloadDir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                file = new File(downloadDir, fileName);
            }

            if (file == null || !file.exists()) {
                call.reject("File not found on device.");
                return;
            }

            String authority = context.getPackageName() + ".fileprovider";
            Uri contentUri = FileProvider.getUriForFile(context, authority, file);

            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(contentUri, mimeType);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            Intent chooser = Intent.createChooser(intent, "Open " + file.getName() + " with");
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            getActivity().startActivity(chooser);

            JSObject result = new JSObject();
            result.put("success", true);
            result.put("message", "Document opened with viewer.");
            call.resolve(result);
        } catch (ActivityNotFoundException e) {
            Log.w(TAG, "No app available to open file of type: " + mimeType);
            JSObject result = new JSObject();
            result.put("success", false);
            result.put("error", "No compatible application found on your device to open this file.");
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error opening document: ", e);
            call.reject("Unable to open file: " + e.getMessage(), e);
        }
    }

    /**
     * Shares a document with other apps using Android ACTION_SEND Intent.
     */
    @PluginMethod
    public void shareDocument(PluginCall call) {
        String filePath = call.getString("filePath");
        String fileName = call.getString("fileName");
        String mimeType = call.getString("mimeType", "application/octet-stream");
        String title = call.getString("title", "Share Document");

        try {
            Context context = getContext();
            File file = null;

            if (filePath != null && !filePath.isEmpty()) {
                file = new File(filePath);
            } else if (fileName != null && !fileName.isEmpty()) {
                File downloadDir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                file = new File(downloadDir, fileName);
            }

            if (file == null || !file.exists()) {
                call.reject("File not found on device.");
                return;
            }

            String authority = context.getPackageName() + ".fileprovider";
            Uri contentUri = FileProvider.getUriForFile(context, authority, file);

            Intent intent = new Intent(Intent.ACTION_SEND);
            intent.setType(mimeType);
            intent.putExtra(Intent.EXTRA_STREAM, contentUri);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

            Intent chooser = Intent.createChooser(intent, title);
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            getActivity().startActivity(chooser);

            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error sharing document: ", e);
            call.reject("Unable to share file: " + e.getMessage(), e);
        }
    }

    /**
     * Checks whether a file exists on device storage.
     */
    @PluginMethod
    public void checkFileExists(PluginCall call) {
        String filePath = call.getString("filePath");
        String fileName = call.getString("fileName");

        Context context = getContext();
        File file = null;

        if (filePath != null && !filePath.isEmpty()) {
            file = new File(filePath);
        } else if (fileName != null && !fileName.isEmpty()) {
            File downloadDir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
            file = new File(downloadDir, fileName);
        }

        JSObject result = new JSObject();
        if (file != null && file.exists()) {
            result.put("exists", true);
            result.put("filePath", file.getAbsolutePath());
            result.put("size", file.length());
        } else {
            result.put("exists", false);
        }
        call.resolve(result);
    }

    private String sanitizeFileName(String fileName) {
        return fileName.replaceAll("[\\\\/:*?\"<>|]", "_");
    }

    private File getUniqueFile(File dir, String fileName) {
        File file = new File(dir, fileName);
        if (!file.exists()) {
            return file;
        }

        String name = fileName;
        String ext = "";
        int dotIndex = fileName.lastIndexOf(".");
        if (dotIndex != -1) {
            name = fileName.substring(0, dotIndex);
            ext = fileName.substring(dotIndex);
        }

        int counter = 1;
        while (file.exists()) {
            file = new File(dir, name + " (" + counter + ")" + ext);
            counter++;
        }
        return file;
    }
}
