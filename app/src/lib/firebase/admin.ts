// app/src/lib/firebase/admin.ts
// Firebase Admin SDK for server-side operations (bypasses security rules)

import * as admin from 'firebase-admin';

// Initialize Admin SDK if not already done
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: 'doctor-app-b2371',
      clientEmail: 'firebase-adminsdk-3i6ht@doctor-app-b2371.iam.gserviceaccount.com',
      privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCq5Ri9qvUwWWwB\ndKsm50p2F/s6SqrtgpvDQF3sm9dBnoDCO9aOIuLLNelsiZR7vYn9whapxoeKyYXj\nT5dhwky2pODArwaMcwbsXPzep/cdEPJk0xX4XgrnubeoBo6sKAHhTL5VoNxOpDEI\nqtwYvrit1Aya4pyhAmw56qCdauAz8Vr4DRn94XKVVVGvBE0jwRxhN4jARGqgBO3B\nZf0p4WKbs6mZTiYjDfjDbPtZ+j0tFNNsru8XZhldkMM0pcT4Q5oH9eTUHcmj5SZG\n2MRYnH86TL7ylN0MsG3L6W1fHQim5NNMdqiHuGLDe4Ju9NY97ir5UTNBML10PQPh\nNJmE6UN5AgMBAAECggEAARgi9EUpBhFIhJ2rFX5wWfjvPT4Q223IhablNkVM/hwf\nxHHU8geNdR71ASKQ/nxyxGeoZ/4zGRbCjyq2QP3yw+eirDEvhRlpqOLmi2sL0fyT\npMTvDgfu7dfUJUgKqu9w2NdTz64OQxWmxIcXJ84CCW22bMASbMiC1pmAdxZh9aTH\nEfKc58tN2ApqDuZ7wSwOTX5BckmMhqKO7iBxU6VnbEPvbNwvr6DobJW7k8jChRAI\nn7Svr2L/VIjoIrJ6wmfFD/wgNgbKy0SYgo4VqNwJYtGRorr4u4m8Le+BKjldyCSQ\nf7yJ5YXmcPMvTqvn0WIYdvnkUioRvjE/Pg6rGJB8QQKBgQDXeCRgWWRaqcDYRizT\njXpEHwo/IE23ud2UZK+uP9Dlhmdc38vf0HU6OmATTJ2xbSY7idUMvRvsFCqoPA4A\nwq8fozm99FQvh46Avmn6UO4+WzbpkF9B0Ky/iUVxlIeqParmH3V0a6odk4CkXrv5\nhWvWjgW1k1uyIBeSxOVq4P0T4QKBgQDLCnz91v5WBlMrxia3EyyoxKCPO9w3IiEl\n4nKfgaN+qE+RsQ2MIbyczhJEbmUdSinGUOUNpqVdy46hLPxD5fP3wJUcvwbeAEiB\n4EfcNmlSjyM4mxcoa6WqAgxErDcdf36mztqRf5WgsTMMBoPH1YIGqEN4hT2RnsJh\nxAAmiZSimQKBgEhS7XLhzouYG0D9HSLNhFLFUH0r7KpU2wlqWoXUqdvBJ4THIfm4\nUQEAgys3Nl9N0d1+QGMMPwkZI9BgiBq9PmcSNNmL344spCqWv5/j9nQ7zczMRw0i\nbDnGa+baAkekd27S9Gvlj65pym5h1hrFLBNSjJwMIGVD3GXJbXBYoNpBAoGASeY2\nWflfNpY0vVDwlF+ROJfgTGGgJBzy7aP+zhlUFWxTEZbcdG1vBa9nLKr1eHSewcR9\nqbtGot3MutLxuhC+/CSG4SCR8kkuGr8zyG2xZdAdJKQmCJstf7QhHPmFUeIuia3u\nFVjXb9Yu2yif3CLUoXGqpPnxz8d1vjmlSGF4zLkCgYEAmTKDM3YekzY40MUzwbdH\nwUG6LGp5oYjZKqZAgwsMvCYJilWBa0TdOD96iZwOEhhLV5xDirHdKlucdgraR29I\nEf/qvQ0QPtNdyjXSjmgmAqvc/OhcSsKwspEu2ZyN3gCZ36aHlSe8TtMwsPdNW/Bj\nlr89yUWNfvAEgbRcwkQ5MR0=\n-----END PRIVATE KEY-----\n',
    }),
  });
}

export const adminDb = admin.firestore();
