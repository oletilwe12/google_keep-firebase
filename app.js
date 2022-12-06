class Note {
    constructor(id, title, text) {
        this.id = id;
        this.title = title;
        this.text = text;
    }
}

class App {
    constructor() {
        // localStorage.setItem('test', JSON.stringify(['123']));
        // console.log(JSON.parse(localStorage.getItem('test')));
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
        console.log(this.notes);
        this.selectedNoteId = ""
        this.miniSidebar = true;

        this.$activeForm = document.querySelector(".active-form");
        this.$inactiveForm = document.querySelector(".inactive-form");
        this.$noteTitle = document.querySelector("#note-title");
        this.$noteText = document.querySelector("#note-text");
        this.$notes = document.querySelector(".notes");
        this.$form = document.querySelector("#form");
        this.$modal = document.querySelector(".modal");
        this.$modalForm = document.querySelector("#modal-form");
        this.$modalTitle = document.querySelector("#modal-title");
        this.$modalText = document.querySelector("#modal-text");
        this.$closeModalForm = document.querySelector("#modal-btn");
        this.$sidebar = document.querySelector(".sidebar");
        this.$sidebarActiveItem = document.querySelector(".active-item");

        this.ui = new firebaseui.auth.AuthUI(auth);
        this.ui.start('#firebaseui-auth-container', {
            signInOptions: [
              firebase.auth.EmailAuthProvider.PROVIDER_ID
            ],
            // Other config options...
          });
        //this.handleAuth();

        this.addEventListeners();
        this.displayNotes();
    }

    addEventListeners() {
        document.body.addEventListener("click", (event) => {
            this.handleFormClick(event)
            this.closeModal(event)
            this.openModal(event)
            this.handleArchiving(event)
        })

        this.$form.addEventListener("submit", (event) => {
            event.preventDefault();
            const title = this.$noteTitle.value;
            const text = this.$noteText.value;
            this.addNote({ title, text });
            this.closeActiveForm();
        })

        this.$modalForm.addEventListener("submit", (event) => {
            event.preventDefault();
        })

        this.$sidebar.addEventListener("mouseover", (event) => {
            this.handleToggleSidebar();
        })
        this.$sidebar.addEventListener("mouseout", (event) => {
            this.handleToggleSidebar();
        })
        
    }

    handleFormClick(event) {
        const isActiveFormClickedOn = this.$activeForm.contains(event.target);
        const isInactiveFormClickedOn = this.$inactiveForm.contains(event.target);
        const title = this.$noteTitle.value;
        const text = this.$noteText.value;

        if (isInactiveFormClickedOn) {
            this.openActiveForm();
        }
        else if (!isInactiveFormClickedOn && !isActiveFormClickedOn) {
            this.addNote({ title, text });
            this.closeActiveForm();
        }    
    }

    openActiveForm() {
        this.$inactiveForm.style.display = "none";
        this.$activeForm.style.display = "block";
        this.$noteText.focus();
    }
    closeActiveForm() {
        this.$inactiveForm.style.display = "block";
        this.$activeForm.style.display = "none";
        this.$noteText.value = "";
        this.$noteTitle.value = "";
    }

    openModal(event) {
        const $selectedNote = event.target.closest(".note");
        if($selectedNote && !event.target.closest(".archive")) {
            this.selectedNoteId = $selectedNote.id;
            this.$modalTitle.value = $selectedNote.children[1].innerHTML;
            this.$modalText.value = $selectedNote.children[2].innerHTML
            this.$modal.classList.add("open-modal");
        } else {
            return;
        }
    }
    closeModal(event) {
        const isModalFormClickedOn = this.$modalForm.contains(event.target);
        const isCloseModalBtnClickedOn = this.$closeModalForm.contains(event.target);
        if((!isModalFormClickedOn || isCloseModalBtnClickedOn) && this.$modal.classList.contains("open-modal")) {
            this.editNote(this.selectedNoteId, { title: this.$modalTitle.value, text: this.$modalText.value })
            this.$modal.classList.remove("open-modal");
        }
    }

    handleArchiving(event) {
        const $selectedNote = event.target.closest(".note");
        if($selectedNote && event.target.closest(".archive")) {
            this.selectedNoteId = $selectedNote.id;
            this.deleteNote(this.selectedNoteId);
        } else {
            return;
        }
    }

    addNote({ title, text }) {
        if (text != "") {
            const newNote = new Note(cuid(), title, text);
            this.notes = [...this.notes, newNote];
            this.render();
        }
    }

    editNote(id, { title, text }) {
        this.notes = this.notes.map((note) => {
            if (note.id == id) {
                note.title = title;
                note.text = text;
            }
            return note;
        });
        this.render();
    }

    deleteNote(id) {
        this.notes = this.notes.filter((note) => note.id != id);
        this.render();
    }

    handleMouseOverNote(element) {
        const $note = document.querySelector("#"+element.id);
        const $checkNote = $note.querySelector(".check-circle");
        const $noteFooter = $note.querySelector(".note-footer");
        $checkNote.style.visibility = "visible";
        $noteFooter.style.visibility = "visible";
    }
    handleMouseOutNote(element) {
        const $note = document.querySelector("#"+element.id);
        const $checkNote = $note.querySelector(".check-circle");
        const $noteFooter = $note.querySelector(".note-footer");
        $checkNote.style.visibility = "hidden";
        $noteFooter.style.visibility = "hidden";
    }

    handleToggleSidebar() {
        if(this.miniSidebar) {
            this.$sidebar.style.width = "250px";
            this.$sidebar.classList.add("sidebar-hover");
            this.$sidebarActiveItem.classList.add("sidebar-active-item");
            this.miniSidebar = false;
        }
        else {
            this.$sidebar.style.width = "80px";
            this.$sidebar.classList.remove("sidebar-hover");
            this.$sidebarActiveItem.classList.remove("sidebar-active-item");
            this.miniSidebar = true;
        }
    }
    
    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }

    render() {
        this.saveNotes();
        this.displayNotes();
    }
    displayNotes() {
        this.$notes.innerHTML = this.notes.map((note) =>
            `
        <div class="note" id="${note.id}" onmouseover="app.handleMouseOverNote(this)" onmouseout="app.handleMouseOutNote(this)">
            <span class="material-icons check-circle">check_circle</span>
            <div class="title">${note.title}</div>
            <div class="text">${note.text}</div>
            <div class="note-footer">
                <div class="tooltip">
                    <span class="material-icons-outlined hover small-icon">add_alert</span>
                    <span class="tooltip-text">Remind me</span>
                </div>
                <div class="tooltip">
                    <span class="material-icons-outlined hover small-icon">person_add</span>
                    <span class="tooltip-text">Collaborator</span>
                </div>
                <div class="tooltip">
                    <span class="material-icons-outlined hover small-icon">palette</span>
                    <span class="tooltip-text">Change Color</span>
                </div>
                <div class="tooltip">
                    <span class="material-icons-outlined hover small-icon">image</span>
                    <span class="tooltip-text">Add Image</span>
                </div>
                <div class="tooltip archive">
                    <span class="material-icons-outlined hover small-icon">archive</span>
                    <span class="tooltip-text">Archive</span>
                </div>
                <div class="tooltip">
                    <span class="material-icons-outlined hover small-icon">more_vert</span>
                    <span class="tooltip-text">More</span>
                </div>
            </div>
        </div>
        `
        ).join("");
    }
}

const app = new App();

