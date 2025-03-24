import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactService } from '../services/contact.service';
import { CommonModule } from '@angular/common';

declare var bootstrap: any; 

interface Contact {
  id: number;
  name: string;
  phone: string;
  email: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  providers: [ContactService]
})
export class ContactComponent implements OnInit {
  contacts: Contact[] = [];
  contactForm: FormGroup;
  isEditMode = false;
  selectedContactId: number | null = null;
  filteredContacts: Contact[] = [];

  constructor(private fb: FormBuilder, private contactService: ContactService) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.loadContacts();
  }

 
  loadContacts() {
    this.contactService.getContacts().subscribe((data) => {
      this.contacts = data;
      this.filteredContacts = [...this.contacts]; // ✅ Ensure filteredContacts is updated
    });
  }

 
  openModal() {
    this.isEditMode = false;
    this.selectedContactId = null;
    this.contactForm.reset();

    const modalElement = document.getElementById('contactModal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }
 
  editContact(contact: Contact) {
    this.isEditMode = true;
    this.selectedContactId = contact.id ?? 0;
    this.contactForm.patchValue({
      name: contact.name || '',
      phone: contact.phone || '',
      email: contact.email || ''
    });

    const modalElement = document.getElementById('contactModal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

 
  searchContacts(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredContacts = this.contacts.filter(contact =>
      contact.name.toLowerCase().includes(query) ||
      contact.phone.includes(query) ||
      contact.email.toLowerCase().includes(query)
    );
  }

  saveContact() {
    if (this.contactForm.valid) {
      if (this.isEditMode && this.selectedContactId !== null) {
        const updatedContact: Contact = {
          id: this.selectedContactId,  // Ensure `id` is assigned correctly
          name: this.contactForm.value.name,
          phone: this.contactForm.value.phone,
          email: this.contactForm.value.email
        };
        this.contactService.updateContact(updatedContact).subscribe(() => {
          this.loadContacts();
          this.closeModal();
        });
      } else {
        const newContact: Contact = {
          id: 0,  
          name: this.contactForm.value.name,
          phone: this.contactForm.value.phone,
          email: this.contactForm.value.email
        };
        this.contactService.addContact(newContact).subscribe(() => {
          this.loadContacts();
          this.closeModal();
        });
      }
    }
  }
  

  //  Properly Close Bootstrap Modal
  closeModal() {
    const modalElement = document.getElementById('contactModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }

  // Delete Contact
deleteContact(id: number) {
  if (confirm('Are you sure you want to delete this contact?')) {
    this.contactService.deleteContact(id).subscribe({
      next: () => {
        this.loadContacts();  
      },
      error: (error) => {
        console.error('Error deleting contact:', error);
        alert('Failed to delete contact. Please try again.');
      }
    });
  }
}

}
