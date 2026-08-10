# VaultDrop — Drag & Drop File Uploader

> A modern, responsive, browser-based image uploader built with HTML5, CSS3, and Vanilla JavaScript.

---

## Project Overview

**VaultDrop** is a polished frontend image upload and management application developed as **Task 3** of the **Internee.pk HTML, CSS & JavaScript Internship**.

The project transforms a basic drag-and-drop uploader into a complete image management interface with file validation, image previews, simulated upload progress, persistent browser storage, responsive design, search, filtering, sorting, and image management features.

The application operates entirely on the client side and does not require a backend, database, or external API.

---

## Internship Task

**Task:** Task 3 — Drag & Drop File Uploader  
**Intern:** Mahnoor Yasir  
**Organization:** Internee.pk  
**Internship:** HTML, CSS & JavaScript Internship  
**Category:** Frontend Development

---

## Core Objective

The primary objective of this project is to demonstrate practical understanding of:

- HTML5 File Input API
- Drag-and-Drop events
- FileReader API
- JavaScript event handling
- Client-side file validation
- Image preview generation
- Simulated upload progress
- Browser-based persistent storage
- Responsive frontend development
- Interactive UI state management

---

## Key Features

### Drag & Drop Upload

Users can drag image files directly into the dedicated upload area.

The interface provides visual feedback while a file is being dragged over the drop zone and returns to its normal state after the interaction.

Supported drag-and-drop events include:

- `dragenter`
- `dragover`
- `dragleave`
- `drop`

---

### File Browser Upload

Users can also select images through the native browser file picker using the **Browse Files** control.

Multiple images can be selected and processed in a single interaction.

---

### Supported Image Formats

VaultDrop supports:

- JPG
- JPEG
- PNG
- GIF

Unsupported file types are rejected before processing.

The application provides clear inline feedback instead of relying on browser alert dialogs.

---

### File Size Validation

The application validates the size of every selected file before processing.

The configured maximum file size is:

**10 MB per image**

Files exceeding the allowed limit are rejected with an appropriate error message.

---

### Image Preview

Valid images are previewed directly in the browser using the JavaScript **FileReader API**.

Each uploaded image can display:

- Image preview
- Filename
- File type
- File size
- Upload status
- Upload information

No external image-processing service is required.

---

### Simulated Upload Progress

Since this is a frontend-only application, the upload process is simulated using JavaScript timing functions.

The interface provides a realistic upload flow with:

- Progress percentage
- Animated progress bar
- Upload state
- Processing state
- Completion state

The progress moves progressively toward completion rather than immediately jumping to 100%.

---

### Persistent Browser Storage

Uploaded image data is persisted using browser storage so that the image library can remain available after a page refresh.

Application preferences and uploaded content can be restored when the application is opened again.

The storage layer also includes handling for storage-related failures so that the interface does not unexpectedly crash when browser storage becomes unavailable or reaches its quota.

> Browser storage limits are controlled by the browser and environment. The application's configured storage budget does not override Chrome's actual storage quota.

---

## Image Library

After successful uploads, images are displayed in a dedicated gallery.

Each image card can provide useful information and management controls such as:

- Image thumbnail
- Filename
- File type
- File size
- Upload information
- Upload status
- Preview
- Download
- Rename
- Delete

The gallery is designed to remain usable as the number of uploaded images increases.

---

## Image Preview & Lightbox

Users can open an uploaded image in a larger preview interface.

The preview experience supports:

- Large image viewing
- Filename information
- Image metadata
- Previous image navigation
- Next image navigation
- Close button
- Click-outside closing
- Escape-key closing

This provides a cleaner experience than opening images in separate browser tabs.

---

## Image Management

VaultDrop provides several management actions for uploaded images.

### Rename

Users can rename the display name of an uploaded image.

### Download

Images can be downloaded directly through the browser.

### Delete

Individual images can be removed from the library.

### Clear All

Users can remove the complete image collection through the clear-all action with confirmation handling.

---

## Duplicate Detection

The application includes duplicate handling to prevent unnecessary repeated entries when the same image is uploaded more than once.

Users receive feedback when a duplicate image is detected.

---

## Upload Queue

Multiple selected images can be processed through an upload queue.

Each item can display its current state, including:

- Waiting
- Uploading
- Processing
- Completed
- Failed

This makes batch uploads easier to understand and monitor.

---

## Search

The image library includes dynamic filename search.

Users can type into the search field to quickly locate a specific uploaded image.

Search results update without requiring a page refresh.

An appropriate empty state is displayed when no matching image is found.

---

## Filtering

Images can be filtered according to available categories such as:

- All
- JPG
- PNG
- GIF
- Completed
- Failed

Filtering occurs dynamically within the existing interface.

---

## Sorting

The gallery supports multiple sorting options, including:

- Newest first
- Oldest first
- Filename A–Z
- Filename Z–A
- Largest file
- Smallest file

This makes larger image collections easier to manage.

---

## Grid & List Views

VaultDrop provides multiple ways to view the image library.

### Grid View

A visual card-based gallery optimized for image browsing.

### List View

A more information-focused layout displaying image details and available actions in a compact format.

The selected viewing preference can be retained for future visits.

---

## Storage Monitoring

The application includes a storage usage indicator to provide visibility into the amount of browser storage being consumed.

The storage interface can communicate:

- Current usage
- Configured application budget
- Storage percentage
- Storage warnings

The application also handles storage failures gracefully rather than allowing them to terminate the application.

---

## Dark Mode

VaultDrop includes a polished dark/light theme system.

The theme affects the entire interface, including:

- Backgrounds
- Cards
- Text
- Borders
- Buttons
- Forms
- Gallery
- Modals
- Progress indicators

The selected theme can be persisted between sessions.

---

## Toast Notifications

The application uses non-blocking toast notifications for important actions.

Notification types include:

- Success
- Error
- Warning
- Information

Examples include successful uploads, invalid files, duplicate detection, storage warnings, and completed actions.

---

## Error Handling

VaultDrop provides client-side error handling for common upload scenarios.

The application can handle situations such as:

- Unsupported file types
- Files exceeding the size limit
- Invalid file objects
- FileReader failures
- Duplicate uploads
- Storage quota issues
- Empty states
- Unexpected frontend errors

Errors are communicated through the interface using clear, user-friendly messages.

---

## Responsive Design

The interface is designed to work across:

- Desktop
- Laptop
- Tablet
- Mobile devices

The layout adapts to different viewport sizes while maintaining:

- Readable typography
- Usable controls
- Responsive gallery layouts
- Touch-friendly interactions
- No unnecessary horizontal scrolling

---

## Accessibility

Accessibility has been considered throughout the interface.

The application uses:

- Semantic HTML5 elements
- Accessible controls
- Keyboard-friendly interactions
- Visible focus states
- Meaningful labels
- Appropriate ARIA attributes where required
- Accessible dialogs and modals
- Keyboard-based modal closing
- Screen-reader-friendly status updates
- Sufficient visual contrast

The goal is to make the interface usable beyond mouse-based interaction.

---

## Keyboard Interaction

Where applicable, the interface supports keyboard interaction for common actions.

Examples include:

- `Enter` for focused controls
- `Space` for interactive controls
- `Escape` to close dialogs
- `Arrow Left` for previous image
- `Arrow Right` for next image

---

## Technology Stack

### Frontend

- **HTML5**
- **CSS3**
- **Vanilla JavaScript (ES6+)**

### Browser APIs

- File Input API
- FileReader API
- Drag-and-Drop API
- localStorage API
- Browser download APIs
- DOM APIs

No backend or database is required.

---

## Design Philosophy

VaultDrop was designed to go beyond a basic internship demonstration.

The interface follows a modern SaaS-inspired design approach focused on:

- Clear visual hierarchy
- Consistent spacing
- Responsive components
- Subtle animations
- Professional typography
- Accessible interaction
- Meaningful feedback
- Clean image management

The goal is to demonstrate both **frontend functionality and interface design quality**.

---


## Running the Project

VaultDrop is designed as a standalone frontend project.

To run the application:

1. Download or clone the project.
2. Open the project in a code editor such as Visual Studio Code.
3. Open `index.html` in a modern web browser.
4. Start using the uploader.

No Node.js installation, package manager, backend server, or database setup is required.

---

## Browser Compatibility

VaultDrop is intended for modern browsers supporting standard HTML5, CSS3, JavaScript ES6+, FileReader, Drag-and-Drop, and browser storage APIs.

Recommended browsers include:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Safari

For the most consistent experience, use a current version of Google Chrome or Microsoft Edge.

---

## Testing Checklist

The application was designed around the following functional checks:

### Upload

- Drag and drop an image
- Browse and select an image
- Select multiple images
- Preview uploaded images
- Monitor simulated upload progress

### Validation

- Test JPG
- Test JPEG
- Test PNG
- Test GIF
- Test unsupported files
- Test oversized files

### Image Management

- Preview image
- Download image
- Rename image
- Delete image
- Clear all images
- Detect duplicates

### Library

- Search images
- Filter images
- Sort images
- Switch between grid and list views

### Persistence

- Refresh the browser
- Confirm stored images remain available
- Confirm preferences remain available

### Interface

- Switch between light and dark themes
- Test desktop layout
- Test tablet layout
- Test mobile layout
- Test keyboard navigation
- Test modal closing behavior

---

## Learning Outcomes

This project provided practical experience with:

- HTML5 semantic structure
- CSS responsive layouts
- CSS variables and modern UI styling
- JavaScript DOM manipulation
- Event listeners
- Drag-and-drop events
- File handling
- FileReader
- Client-side validation
- Progress simulation
- Browser storage
- Dynamic rendering
- Modal interfaces
- Search and filtering
- Sorting logic
- Responsive UI development
- Accessibility principles
- Error handling
- Frontend state management

---

## Future Improvements

Possible future enhancements for a production environment include:

- Secure server-side file uploads
- Cloud object storage
- User authentication
- Image compression
- Automatic thumbnail generation
- Image metadata extraction
- Folder-based organization
- Drag-to-reorder galleries
- Cloud synchronization
- Upload cancellation
- Resumable uploads
- Server-side validation
- Virus and malware scanning
- Advanced image editing tools

These features would require backend infrastructure and are intentionally outside the scope of this frontend-only internship project.

---

## Project Status

**Completed — Frontend Internship Task**

VaultDrop successfully demonstrates the core requirements of the Drag & Drop File Uploader task while extending them into a more complete and polished browser-based image management experience.

---

## Author

**Mahnoor Yasir**

HTML, CSS & JavaScript Intern  
Internee.pk Virtual Internship Program

---

## Acknowledgement

Developed as part of the **Internee.pk HTML, CSS & JavaScript Internship Program**.

The project focuses on practical frontend development, browser APIs, responsive interface design, and building functional web experiences from a defined technical specification.
