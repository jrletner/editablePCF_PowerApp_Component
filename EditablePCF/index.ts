import { IInputs, IOutputs } from './generated/ManifestTypes';

export class EditablePCF implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  /**
   * Empty constructor.
   */

  // The PCF context object\
  private context: ComponentFramework.Context<IInputs>;
  // The wrapper div element for the component\
  private container: HTMLDivElement;
  // The callback function to call whenever your code has made a change to a bound or output property\
  private notifyOutputChanged: () => void;
  // Flag to track if the component is in edit mode or not\
  private isEditMode: boolean;
  // Tracking variable for the name property\
  private name: string | null;

  constructor() {}

  public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement) {
    // Track all the things
    this.context = context;
    this.notifyOutputChanged = notifyOutputChanged;
    this.container = container;
    this.isEditMode = false;

    // Create the span element to hold the project name

    const message = document.createElement('span');
    message.innerText = `Project name: ${this.isEditMode ? '' : context.parameters.Name.raw}`;

    // Create the textbox to edit the name
    const text = document.createElement('input');
    text.type = 'text';
    text.style.display = this.isEditMode ? 'block' : 'none';

    if (context.parameters.Name.raw) {
      text.value = context.parameters.Name.raw;
      // Wrap the two above elements in a div to box out the content
      const messageContainer = document.createElement('div');
      messageContainer.appendChild(message);
      messageContainer.appendChild(text);

      // Create the button element to switch between edit and read modes

      const button = document.createElement('button');
      button.textContent = this.isEditMode ? 'Save' : 'Edit';
      button.addEventListener('click', () => {
        this.buttonClick();
      });

      // Add the message container and button to the overall control container
      this.container.appendChild(messageContainer);
      this.container.appendChild(button);
    }
  }

  public buttonClick() {
    // Get our controls via DOM queries

    const text = this.container.querySelector('input')!;
    const message = this.container.querySelector('span')!;
    const button = this.container.querySelector('button')!;

    // If not in edit mode, copy the current name value to the textbox

    if (!this.isEditMode) {
      text.value = this.name ?? '';
    } else if (text.value != this.name) {
      // if in edit mode, copy the textbox value to name and call the notify callback
      this.name = text.value;
      this.notifyOutputChanged();
    }

    // flip the mode flag
    this.isEditMode = !this.isEditMode;

    // Set up the new output based on changes
    message.innerText = `Project name: ${this.isEditMode ? '' : this.name}`;
    text.style.display = this.isEditMode ? 'inline' : 'none';
    text.value = this.name ?? '';
    button.textContent = this.isEditMode ? 'Save' : 'Edit';
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    // Checks for updates coming in from outside
    this.name = context.parameters.Name.raw;
    const message = this.container.querySelector('span')!;
    message.innerText = `Project name: ${this.name}`;
  }

  public getOutputs(): IOutputs {
    return {
      // If our name variable is null, return undefined instead
      Name: this.name ?? undefined,
    };
  }

  public destroy() {
    // Remove the event listener we created in init
    this.container.querySelector('button')!.removeEventListener('click', this.buttonClick);
  }
}
