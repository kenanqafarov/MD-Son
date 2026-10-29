package com.rustam.modern_dentistry.util.constants;

public interface Directory {
    String pathPatInsuranceBalance = "media/patient/insurance/balance";
    String pathPatPhoto = "media/patient/photo";
    String pathPatXray = "media/patient/xray";
    String pathPatVideo = "media/patient/video";
    String pathDentalOrder = "media/laboratory/dental/order";

    // Relative URL, so files load from whatever host serves the frontend (nginx proxies /media)
    static String getUrl(String path, String fileName) {
        return "/" + path + "/" + fileName;
    }
}
