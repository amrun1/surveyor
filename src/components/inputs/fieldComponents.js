// formConfig field `type` → input component. Shared by Form.vue (top-level fields)
// and ItemList.vue (the fields inside one row), so a row's sub-form uses exactly
// the same inputs as the main form. `itemList`/`photoList` are deliberately NOT
// here — Form.vue adds them; rows can't contain nested lists.
import TextInput from './TextInput.vue'
import NumberInput from './NumberInput.vue'
import TextArea from './TextArea.vue'
import CanvasDraw from './canvasdraw/CanvasDraw.vue'
import MapDisplay from './MapDisplay.vue'
import SelectInput from './SelectInput.vue'
import RadioGroup from './RadioGroup.vue'
import CheckboxGroup from './CheckboxGroup.vue'
import CameraCapture from './CameraCapture.vue'
import AttachmentPicker from './AttachmentPicker.vue'
import ReadOnlyField from './ReadOnlyField.vue'

export const FIELD_COMPONENTS = {
    text: TextInput,
    number: NumberInput,
    textarea: TextArea,
    canvas: CanvasDraw,
    map: MapDisplay,
    select: SelectInput,
    radio: RadioGroup,
    checkboxes: CheckboxGroup,
    camera: CameraCapture,
    attachment: AttachmentPicker
}

// A field's `type` says what widget it WOULD be; `computed: true` overrides that with
// a read-only display instead, regardless of type — a computed select-type field (if
// one ever exists) gets the same plain info card as a computed text field.
export function resolveFieldComponent(field, components = FIELD_COMPONENTS) {
    return field.computed ? ReadOnlyField : components[field.type]
}
